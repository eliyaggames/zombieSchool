/**
 * Local online lobby + room relay for Eliya Zombie School.
 * Serves the static game and WebSocket matchmaking on one port.
 */
const path = require("path");
const http = require("http");
const fs = require("fs");
const express = require("express");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT) || 8787;
const app = express();
const root = __dirname;
const LEADERBOARD_PATH = path.join(root, "data", "coins-leaderboard.json");
const LEADERBOARD_SIZE = 200;
/** Bump to wipe stage records (e.g. after creator farming). */
const STAGE_EPOCH = 2;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(root));

function digitCount(s) {
  return (String(s || "").match(/\d/g) || []).length;
}

function normalizeBoardName(raw) {
  let n = String(raw || "")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 15);
  if (!n) n = "שחקן";
  if (digitCount(n) !== 3) {
    const base = n.replace(/\d/g, "").trim() || "שחקן";
    const digits = (n.match(/\d/g) || []).join("").slice(0, 3).padEnd(3, "0");
    n = (base + digits).slice(0, 15);
  }
  return n;
}

function normalizeLookup(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[ךםןףץ]/g, (ch) =>
      ({ ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" }[ch])
    )
    .replace(/\s+/g, "");
}

function nameDigits(s) {
  return (String(s || "").match(/\d/g) || []).join("");
}

function loadLeaderboard() {
  try {
    const raw = fs.readFileSync(LEADERBOARD_PATH, "utf8");
    const data = JSON.parse(raw);
    let entries = [];
    let fileEpoch = 0;
    if (Array.isArray(data)) {
      entries = data;
    } else if (data && Array.isArray(data.entries)) {
      entries = data.entries;
      fileEpoch = data.stageEpoch | 0;
    }
    if (fileEpoch < STAGE_EPOCH) {
      entries = entries.map((e) => ({
        ...e,
        bestWorld: 0,
        bestLevel: -1,
      }));
      saveLeaderboard(entries);
    }
    return entries;
  } catch (_) {}
  return [];
}

function saveLeaderboard(entries) {
  try {
    fs.mkdirSync(path.dirname(LEADERBOARD_PATH), { recursive: true });
    fs.writeFileSync(
      LEADERBOARD_PATH,
      JSON.stringify({ stageEpoch: STAGE_EPOCH, entries }, null, 2),
      "utf8"
    );
  } catch (err) {
    console.warn("leaderboard save failed", err.message);
  }
}

function stageEpochOk(body) {
  return body && (body.stageEpoch | 0) >= STAGE_EPOCH;
}

function sortBoard(entries) {
  return entries
    .slice()
    .sort(
      (a, b) =>
        b.coins - a.coins ||
        String(a.name).localeCompare(String(b.name), "he")
    )
    .slice(0, LEADERBOARD_SIZE);
}

function progressScore(worldIndex, levelIndex) {
  const per = 11;
  const l = levelIndex == null || levelIndex < 0 ? -1 : levelIndex | 0;
  if (l < 0) return -1;
  return (worldIndex | 0) * per + l;
}

function applyBestStage(entry, bestWorld, bestLevel) {
  if (!entry) return false;
  const w = bestWorld | 0;
  const l = bestLevel == null || bestLevel < 0 ? -1 : bestLevel | 0;
  if (l < 0) return false;
  if (
    progressScore(w, l) >
    progressScore(entry.bestWorld | 0, entry.bestLevel ?? -1)
  ) {
    entry.bestWorld = w;
    entry.bestLevel = l;
    return true;
  }
  return false;
}

function boardPayload(entries, focusName) {
  const sorted = sortBoard(entries);
  const rows = sorted.map((e, i) => ({
    rank: i + 1,
    name: e.name,
    coins: e.coins,
    bestWorld: e.bestWorld | 0,
    bestLevel: e.bestLevel == null ? -1 : e.bestLevel | 0,
  }));
  let myRank = null;
  if (focusName) {
    const idx = sorted.findIndex(
      (e) => e.name.toLowerCase() === focusName.toLowerCase()
    );
    if (idx >= 0) myRank = idx + 1;
  }
  return { size: LEADERBOARD_SIZE, rows, myRank, count: sorted.length };
}

/** @type {{ name:string, coins:number, updatedAt:number }[]} */
let coinBoard = sortBoard(loadLeaderboard());

function ensureBoardEntry(rawName, coins, bestWorld, bestLevel) {
  const name = normalizeBoardName(rawName);
  // Skip auto placeholder names like "שחקן 3"
  if (!name || /^שחקן(\s*\d+)?$/i.test(String(rawName || "").trim())) return;
  const c = Math.max(0, Math.min(999999, Math.floor(Number(coins) || 0)));
  const existing = coinBoard.find(
    (e) => e.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    let changed = false;
    if (c > existing.coins) {
      existing.coins = c;
      existing.updatedAt = Date.now();
      changed = true;
    }
    if (applyBestStage(existing, bestWorld, bestLevel)) changed = true;
    if (changed) {
      coinBoard = sortBoard(coinBoard);
      saveLeaderboard(coinBoard);
    }
    return;
  }
  const row = { name, coins: c, updatedAt: Date.now(), bestWorld: 0, bestLevel: -1 };
  applyBestStage(row, bestWorld, bestLevel);
  coinBoard.push(row);
  coinBoard = sortBoard(coinBoard);
  saveLeaderboard(coinBoard);
}

app.get("/api/coins", (req, res) => {
  const name = req.query.name ? normalizeBoardName(String(req.query.name)) : "";
  res.json(boardPayload(coinBoard, name));
});

app.post("/api/coins", (req, res) => {
  const name = normalizeBoardName(req.body && req.body.name);
  const coins = Math.max(
    0,
    Math.min(999999, Math.floor(Number(req.body && req.body.coins) || 0))
  );
  const bestWorld = req.body && req.body.bestWorld;
  const bestLevel = req.body && req.body.bestLevel;
  const acceptStage = stageEpochOk(req.body);
  const existing = coinBoard.find(
    (e) => e.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    if (coins > existing.coins) {
      existing.coins = coins;
      existing.updatedAt = Date.now();
    }
    if (acceptStage) applyBestStage(existing, bestWorld, bestLevel);
  } else {
    const row = {
      name,
      coins,
      updatedAt: Date.now(),
      bestWorld: 0,
      bestLevel: -1,
    };
    if (acceptStage) applyBestStage(row, bestWorld, bestLevel);
    coinBoard.push(row);
  }
  coinBoard = sortBoard(coinBoard);
  saveLeaderboard(coinBoard);
  res.json(boardPayload(coinBoard, name));
});

/** Merge many local scores into the shared board (keeps max coins per name). */
app.post("/api/coins/bulk", (req, res) => {
  const list = (req.body && req.body.entries) || [];
  if (!Array.isArray(list)) {
    res.status(400).json({ error: "entries required" });
    return;
  }
  const acceptStage = stageEpochOk(req.body);
  let changed = false;
  for (const item of list) {
    if (!item || !item.name) continue;
    const name = normalizeBoardName(item.name);
    if (!name || /^שחקן(\s*\d+)?$/i.test(String(item.name).trim())) continue;
    const coins = Math.max(
      0,
      Math.min(999999, Math.floor(Number(item.coins) || 0))
    );
    const existing = coinBoard.find(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      if (coins > existing.coins) {
        existing.coins = coins;
        existing.updatedAt = Date.now();
        changed = true;
      }
      if (
        acceptStage &&
        applyBestStage(existing, item.bestWorld, item.bestLevel)
      ) {
        changed = true;
      }
    } else {
      const row = {
        name,
        coins,
        updatedAt: Date.now(),
        bestWorld: 0,
        bestLevel: -1,
      };
      if (acceptStage) applyBestStage(row, item.bestWorld, item.bestLevel);
      coinBoard.push(row);
      changed = true;
    }
  }
  if (changed) {
    coinBoard = sortBoard(coinBoard);
    saveLeaderboard(coinBoard);
  }
  const focus = req.body && req.body.name ? normalizeBoardName(req.body.name) : "";
  res.json(boardPayload(coinBoard, focus));
});

app.get("/api/lobby", (_req, res) => {
  res.json({
    online: clients.size,
    all: [...clients.values()].map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
    })),
    lobby: [...clients.values()]
      .filter((c) => c.status === "lobby")
      .map((c) => ({ id: c.id, name: c.name })),
  });
});

app.get("/api/who", (_req, res) => {
  const lines = [...clients.values()].map(
    (c) => `${c.name} (${c.status})`
  );
  res.type("text").send(
    lines.length
      ? `Connected now (${lines.length}):\n` + lines.join("\n")
      : "Nobody connected right now.\nOpen http://THIS-PC:8787 and tap Online on both devices."
  );
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

let nextId = 1;
/** @type {Map<number, { id:number, name:string, ws:import('ws').WebSocket, status:string, roomId:string|null }>} */
const clients = new Map();
/** @type {Map<string, { id:string, mode:string, hostId:number, guestId:number }>} */
const rooms = new Map();
/** @type {Map<string, { id:string, fromId:number, toId:number, mode:string }>} */
const invites = new Map();

function send(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function lobbyList(exceptId) {
  return [...clients.values()]
    .filter((c) => c.id !== exceptId && c.status === "lobby")
    .map((c) => ({ id: c.id, name: c.name }));
}

function broadcastLobby() {
  for (const c of clients.values()) {
    if (c.status !== "lobby") continue;
    send(c.ws, { type: "lobby", players: lobbyList(c.id) });
  }
}

function publicName(raw) {
  return normalizeBoardName(raw);
}

wss.on("connection", (ws) => {
  const id = nextId++;
  // Start as "away" until they open the invite lobby screen
  const client = { id, name: `שחקן ${id}`, ws, status: "away", roomId: null };
  clients.set(id, client);
  send(ws, { type: "welcome", id, name: client.name });

  ws.on("message", (buf) => {
    let msg;
    try {
      msg = JSON.parse(String(buf));
    } catch {
      return;
    }
    if (!msg || typeof msg.type !== "string") return;

    if (msg.type === "set_name") {
      client.name = publicName(msg.name);
      ensureBoardEntry(client.name, 0);
      send(ws, { type: "name_ok", name: client.name });
      broadcastLobby();
      return;
    }

    if (msg.type === "set_status") {
      const next =
        msg.status === "lobby"
          ? "lobby"
          : msg.status === "playing"
            ? "playing"
            : "away";
      if (client.roomId && next !== "playing") {
        // leaving lobby while in a room handled by leave_room
      }
      if (!client.roomId) {
        client.status = next === "playing" ? "away" : next;
        broadcastLobby();
        if (client.status === "lobby") {
          send(ws, { type: "lobby", players: lobbyList(id) });
        }
      }
      return;
    }

    if (msg.type === "get_lobby") {
      send(ws, { type: "lobby", players: lobbyList(id) });
      return;
    }

    if (msg.type === "invite_by_query") {
      if (client.status !== "lobby") {
        send(ws, {
          type: "error",
          message: "צריך להיות במסך אונליין כדי להזמין",
        });
        return;
      }
      const q = normalizeLookup(msg.query || "");
      if (!q) {
        send(ws, { type: "error", message: "כתבו שם או 3 ספרות" });
        return;
      }
      const candidates = [...clients.values()].filter(
        (c) => c.id !== id && c.status === "lobby"
      );
      const match =
        candidates.find((c) => normalizeLookup(c.name) === q) ||
        candidates.find((c) => nameDigits(c.name) === q) ||
        candidates.find((c) => normalizeLookup(c.name).includes(q));
      if (!match) {
        send(ws, {
          type: "error",
          message:
            "לא נמצא שחקן באונליין עם השם/ספרות האלה. בדקו שהוא במסך אונליין.",
        });
        return;
      }
      // Reuse invite flow
      msg = { type: "invite", toId: match.id };
      // fall through by recursive-style: duplicate invite logic via goto not available —
      // call by setting and continuing - easiest: inline
      const toId = match.id;
      const target = match;
      for (const [key, inv] of invites) {
        if (inv.fromId === id && inv.toId === toId) invites.delete(key);
      }
      const inviteId = `inv_${id}_${toId}_${Date.now()}`;
      invites.set(inviteId, { id: inviteId, fromId: id, toId, mode: null });
      send(target.ws, {
        type: "invite",
        inviteId,
        fromId: id,
        fromName: client.name,
      });
      send(ws, {
        type: "invite_sent",
        inviteId,
        toName: target.name,
      });
      return;
    }

    if (msg.type === "invite") {
      const toId = Number(msg.toId);
      const target = clients.get(toId);
      // Only notify if the other player is in the invite lobby
      if (!target || target.status !== "lobby") {
        send(ws, {
          type: "error",
          message: "השחקן לא בלובי ההזמנות כרגע",
        });
        return;
      }
      if (client.status !== "lobby") {
        send(ws, {
          type: "error",
          message: "צריך להיות בלובי ההזמנות כדי להזמין",
        });
        return;
      }
      if (toId === id) return;

      // Cancel previous pending invites from this player to same target
      for (const [key, inv] of invites) {
        if (inv.fromId === id && inv.toId === toId) invites.delete(key);
      }

      const inviteId = `inv_${id}_${toId}_${Date.now()}`;
      invites.set(inviteId, { id: inviteId, fromId: id, toId, mode: null });
      send(target.ws, {
        type: "invite",
        inviteId,
        fromId: id,
        fromName: client.name,
      });
      send(ws, {
        type: "invite_sent",
        inviteId,
        toName: target.name,
      });
      return;
    }

    if (msg.type === "invite_respond") {
      const invite = invites.get(String(msg.inviteId));
      if (!invite || invite.toId !== id) return;
      invites.delete(invite.id);
      const from = clients.get(invite.fromId);
      if (!from) return;

      if (!msg.accept) {
        send(from.ws, {
          type: "invite_declined",
          byName: client.name,
        });
        return;
      }

      // Invitee chooses: coop (with me) or versus (against me)
      const mode = msg.mode === "versus" ? "versus" : "coop";

      if (from.status !== "lobby" || client.status !== "lobby") {
        send(ws, { type: "error", message: "מישהו כבר יצא מהלובי" });
        send(from.ws, { type: "error", message: "מישהו כבר יצא מהלובי" });
        return;
      }

      const roomId = `room_${invite.fromId}_${id}_${Date.now()}`;
      rooms.set(roomId, {
        id: roomId,
        mode,
        hostId: invite.fromId,
        guestId: id,
      });
      from.status = "playing";
      client.status = "playing";
      from.roomId = roomId;
      client.roomId = roomId;
      broadcastLobby();

      const payload = {
        type: "room_start",
        roomId,
        mode,
        hostId: invite.fromId,
        guestId: id,
        hostName: from.name,
        guestName: client.name,
      };
      send(from.ws, payload);
      send(ws, payload);
      return;
    }

    if (msg.type === "input" || msg.type === "state" || msg.type === "throw" || msg.type === "event") {
      if (!client.roomId) return;
      const room = rooms.get(client.roomId);
      if (!room) return;
      const otherId = room.hostId === id ? room.guestId : room.hostId;
      const other = clients.get(otherId);
      if (other) send(other.ws, { ...msg, fromId: id });
      return;
    }

    if (msg.type === "leave_room") {
      leaveRoom(client);
      return;
    }
  });

  ws.on("close", () => {
    leaveRoom(client);
    clients.delete(id);
    for (const [key, inv] of invites) {
      if (inv.fromId === id || inv.toId === id) invites.delete(key);
    }
    broadcastLobby();
  });
});

function leaveRoom(client) {
  if (!client.roomId) {
    if (client.status === "playing") client.status = "away";
    return;
  }
  const room = rooms.get(client.roomId);
  const roomId = client.roomId;
  client.roomId = null;
  client.status = "away";
  if (!room) {
    broadcastLobby();
    return;
  }
  rooms.delete(roomId);
  for (const pid of [room.hostId, room.guestId]) {
    const c = clients.get(pid);
    if (!c) continue;
    c.roomId = null;
    c.status = "away";
    if (c.id !== client.id) {
      send(c.ws, { type: "peer_left", name: client.name });
    }
  }
  broadcastLobby();
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Eliya game online at http://0.0.0.0:${PORT}`);
  console.log(`WebSocket path: ws://<ip>:${PORT}/ws`);
});
