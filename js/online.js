/**
 * Online lobby + room client for cross-device play.
 * Exposes window.OnlineNet
 */
(() => {
  function normalizeName(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[\u0591-\u05C7]/g, "") // Hebrew nikud
      .replace(/[ךםןףץ]/g, (ch) => ({ "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" }[ch]))
      .replace(/\s+/g, "");
  }

  const OnlineNet = {
    ws: null,
    id: null,
    name: "",
    connected: false,
    players: [],
    room: null,
    isHost: false,
    handlers: {},
    _lobbyTimer: null,

    on(type, fn) {
      this.handlers[type] = fn;
    },

    emit(type, data) {
      const fn = this.handlers[type];
      if (fn) fn(data);
    },

    wsUrl() {
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const host = location.host || "localhost:8787";
      return `${proto}//${host}/ws`;
    },

    connect(name) {
      return new Promise((resolve, reject) => {
        if (this.ws && this.ws.readyState === 1) {
          this.setName(name);
          this.refreshLobby();
          resolve(this);
          return;
        }
        // Close stale socket if any
        if (this.ws) {
          try {
            this.ws.onclose = null;
            this.ws.close();
          } catch (_) {}
          this.ws = null;
        }

        let settled = false;
        try {
          this.ws = new WebSocket(this.wsUrl());
        } catch (err) {
          reject(err);
          return;
        }
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error("timeout"));
          }
        }, 6000);

        this.ws.onopen = () => {
          this.connected = true;
          this.setName(name);
          this.startLobbyPolling();
        };
        this.ws.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(new Error("ws error"));
          }
        };
        this.ws.onclose = () => {
          this.connected = false;
          this.room = null;
          this.stopLobbyPolling();
          this.emit("disconnected", {});
        };
        this.ws.onmessage = (ev) => {
          let msg;
          try {
            msg = JSON.parse(ev.data);
          } catch {
            return;
          }
          this.handle(msg);
          if (msg.type === "welcome" && !settled) {
            settled = true;
            clearTimeout(timer);
            // Ensure name + fresh lobby after welcome
            this.setName(name);
            this.refreshLobby();
            resolve(this);
          }
        };
      });
    },

    startLobbyPolling() {
      this.stopLobbyPolling();
      this._lobbyTimer = setInterval(() => {
        if (this.connected && !this.room) this.refreshLobby();
      }, 2000);
    },

    stopLobbyPolling() {
      if (this._lobbyTimer) {
        clearInterval(this._lobbyTimer);
        this._lobbyTimer = null;
      }
    },

    handle(msg) {
      switch (msg.type) {
        case "welcome":
          this.id = msg.id;
          this.name = msg.name;
          break;
        case "name_ok":
          this.name = msg.name;
          break;
        case "lobby":
          this.players = msg.players || [];
          this.emit("lobby", this.players);
          break;
        case "invite":
          this.emit("invite", msg);
          break;
        case "invite_sent":
          this.emit("invite_sent", msg);
          break;
        case "invite_declined":
          this.emit("invite_declined", msg);
          break;
        case "room_start":
          this.room = msg;
          this.isHost = msg.hostId === this.id;
          this.stopLobbyPolling();
          this.emit("room_start", msg);
          break;
        case "input":
        case "state":
        case "throw":
        case "event":
          this.emit(msg.type, msg);
          break;
        case "peer_left":
          this.room = null;
          this.startLobbyPolling();
          this.emit("peer_left", msg);
          break;
        case "error":
          this.emit("error", msg);
          break;
        default:
          break;
      }
    },

    send(msg) {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(msg));
      }
    },

    setName(name) {
      this.send({ type: "set_name", name });
    },

    setLobbyStatus(inLobby) {
      this.send({ type: "set_status", status: inLobby ? "lobby" : "away" });
    },

    refreshLobby() {
      this.send({ type: "get_lobby" });
    },

    invite(toId) {
      this.send({ type: "invite", toId: Number(toId) });
    },

    inviteByQuery(query) {
      this.send({ type: "invite_by_query", query: String(query || "") });
    },

    respondInvite(inviteId, accept, mode) {
      this.send({
        type: "invite_respond",
        inviteId,
        accept: !!accept,
        mode: mode === "versus" ? "versus" : "coop",
      });
    },

    sendInput(payload) {
      this.send({ type: "input", ...payload });
    },

    sendState(payload) {
      this.send({ type: "state", ...payload });
    },

    leaveRoom() {
      this.send({ type: "leave_room" });
      this.room = null;
      if (this.connected) this.startLobbyPolling();
    },

    disconnect() {
      try {
        this.stopLobbyPolling();
        this.leaveRoom();
        if (this.ws) this.ws.close();
      } catch (_) {}
      this.ws = null;
      this.connected = false;
    },

    /** Soft search: empty query = everyone; otherwise substring match on normalized names */
    search(query) {
      const q = normalizeName(query);
      if (!q) return this.players.slice();
      return this.players.filter((p) => normalizeName(p.name).includes(q));
    },
  };

  window.OnlineNet = OnlineNet;
})();
