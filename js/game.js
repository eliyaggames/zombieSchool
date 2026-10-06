(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  function t(key, vars) {
    return window.I18n ? I18n.t(key, vars) : key;
  }

  function worldLabel(index) {
    return window.I18n ? I18n.worldName(index) : `World ${index + 1}`;
  }

  function bossLabel(index) {
    return window.I18n ? I18n.bossTitle(index) : "Boss";
  }

  const hud = document.getElementById("hud");
  const topbar = document.getElementById("topbar");
  const playfield = document.getElementById("playfield");
  const levelNumEl = document.getElementById("levelNum");
  const livesEl = document.getElementById("lives");
  const keyStatusEl = document.getElementById("keyStatus");
  const coinStatusEl = document.getElementById("coinStatus");
  const menuCoinsEl = document.getElementById("menuCoins");
  const leaderboardListEl = document.getElementById("leaderboardList");
  const leaderboardMeEl = document.getElementById("leaderboardMe");
  const leaderboardHintEl = document.getElementById("leaderboardHint");
  const modeHud = document.getElementById("modeHud");
  const modeStatusEl = document.getElementById("modeStatus");
  const bookHud = document.getElementById("bookHud");
  const bookStatusEl = document.getElementById("bookStatus");
  const pauseBtn = document.getElementById("pauseBtn");
  const controls = document.getElementById("controls");
  const padP1 = document.getElementById("padP1");
  const padP2 = document.getElementById("padP2");
  const joy1 = document.getElementById("joy1");
  const knob1 = document.getElementById("knob1");
  const joy2 = document.getElementById("joy2");
  const knob2 = document.getElementById("knob2");
  const throwBtn1 = document.getElementById("throwBtn1");
  const throwRing1 = document.getElementById("throwRing1");
  const throwBtn2 = document.getElementById("throwBtn2");
  const throwRing2 = document.getElementById("throwRing2");
  const nameInputP1 = document.getElementById("nameInputP1");
  const nameInputP1b = document.getElementById("nameInputP1b");
  const nameInputP2 = document.getElementById("nameInputP2");
  const padLabel1 = document.getElementById("padLabel1");
  const padLabel2 = document.getElementById("padLabel2");

  const NAME_KEY_P1 = "eliya_player_name_p1";
  const NAME_KEY_P2 = "eliya_player_name_p2";
  const COINS_KEY = "eliya_coins";
  const PROGRESS_KEY = "eliya_campaign_save";
  const LOCAL_BOARD_KEY = "eliya_coins_board";
  const CLEARED_LEVELS_KEY = "eliya_cleared_levels";
  const BEST_STAGE_KEY = "eliya_best_stage";
  const BEST_STAGE_EPOCH_KEY = "eliya_best_stage_epoch";
  /** Bump to wipe creator-inflated stage records for everyone. */
  const BEST_STAGE_EPOCH = 2;
  const COIN_LEVEL = 3;
  const COIN_BOSS = 10;
  const COIN_REPLAY = 2;
  const LEADERBOARD_SIZE = 200;

  const BOOK_UNLOCK_LEVEL = 4;
  const BOOK_COOLDOWN = 150;
  const STUN_TIME = 300;
  const BOOK_SPEED = 6.2;
  const REVIVE_DIST = 24;
  const SABOTAGE_SPEED = 5.4;
  const BOSS_ROOT_TIME = 300; // 5 seconds @ ~60fps

  const P1_PALETTE = {
    body: "#2f6fed",
    skin: "#f0c7a0",
    eye: "#ffffff",
    pupil: "#1a1a1a",
    accent: "#f0b429",
  };
  const P2_PALETTE = {
    body: "#e85d4c",
    skin: "#f0c7a0",
    eye: "#ffffff",
    pupil: "#1a1a1a",
    accent: "#f0b429",
  };
  const FROZEN_PALETTE = {
    body: "#7a8a98",
    skin: "#c8d4e0",
    eye: "#e8f0ff",
    pupil: "#3a4a58",
    accent: "#90a0b0",
  };

  const AVATAR_KEY = "eliya_avatar_v1";
  const AVATAR_SKINS = ["#f0c7a0", "#e0a878", "#c68642", "#8d5524", "#ffe0bd"];
  const AVATAR_BODIES = [
    "#2f6fed",
    "#e85d4c",
    "#3ecf8e",
    "#f0b429",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
    "#34495e",
  ];
  const AVATAR_HAIR_COLORS = [
    "#1a1a1a",
    "#5c3317",
    "#c9a227",
    "#e85d4c",
    "#2f6fed",
    "#f5f5f5",
  ];
  const AVATAR_HAIR_STYLES = [
    { id: "none", labelKey: "hair_none" },
    { id: "short", labelKey: "hair_short" },
    { id: "long", labelKey: "hair_long" },
    { id: "curly", labelKey: "hair_curly" },
    { id: "spikes", labelKey: "hair_spikes" },
    { id: "rock", labelKey: "hair_rock" },
    { id: "fade", labelKey: "hair_fade" },
    { id: "cap", labelKey: "hair_cap" },
  ];

  const DEFAULT_AVATAR = {
    skin: AVATAR_SKINS[0],
    body: AVATAR_BODIES[0],
    hair: "short",
    hairColor: AVATAR_HAIR_COLORS[0],
  };

  let avatarDraft = { ...DEFAULT_AVATAR };

  const SABOTAGE_KINDS = [
    { emoji: "🍌", slow: 180 },
    { emoji: "🧴", slow: 150 },
    { emoji: "🪑", slow: 200 },
  ];

  const screens = {
    menu: document.getElementById("menuScreen"),
    twoPlayer: document.getElementById("twoPlayerScreen"),
    online: document.getElementById("onlineScreen"),
    howto: document.getElementById("howtoScreen"),
    leaderboard: document.getElementById("leaderboardScreen"),
    settings: document.getElementById("settingsScreen"),
    creator: document.getElementById("creatorScreen"),
    story: document.getElementById("storyScreen"),
    level: document.getElementById("levelScreen"),
    pause: document.getElementById("pauseScreen"),
    fail: document.getElementById("failScreen"),
    win: document.getElementById("winScreen"),
  };

  const inviteToast = document.getElementById("inviteToast");
  const onlineListEl = document.getElementById("onlineList");
  const onlineEmptyEl = document.getElementById("onlineEmpty");
  const onlineStatusEl = document.getElementById("onlineStatus");
  const onlineSearchEl = document.getElementById("onlineSearch");

  const state = {
    mode: "menu",
    playMode: "solo",
    versusScore: [0, 0],
    versusFinal: false,
    levelIndex: 0,
    worldIndex: 0,
    lives: 3,
    coins: 0,
    creator: false,
    keys: 0,
    keysNeeded: 1,
    time: 0,
    shake: 0,
    players: [],
    zombies: [],
    boss: null,
    particles: [],
    books: [],
    notes: [],
    sabotageItems: [],
    sabotageProjs: [],
    camera: { x: 0, y: 0 },
    keysHeld: Object.create(null),
    level: null,
    tileSize: 32,
    animId: 0,
    versusWinner: null,
    names: ["", ""],
    online: false,
    onlineRole: null, // "host" | "guest"
    myPlayerId: 0,
    remoteInput: { x: 0, y: 0, throwQueued: false },
    pendingInviteId: null,
    netSendAcc: 0,
    renderScale: 1,
    dpr: 1,
  };

  function loadNames() {
    try {
      const n1 = localStorage.getItem(NAME_KEY_P1);
      const n2 = localStorage.getItem(NAME_KEY_P2);
      if (n1 && n1.trim()) state.names[0] = n1.trim().slice(0, 15);
      if (n2 && n2.trim()) state.names[1] = n2.trim().slice(0, 15);
    } catch (_) {
      /* ignore */
    }
    if (nameInputP1) nameInputP1.value = state.names[0] || "";
    if (nameInputP1b) nameInputP1b.value = state.names[0] || "";
    if (nameInputP2) nameInputP2.value = state.names[1] || "";
    syncNameLabels();
    syncMenuNameLine();
    if (!isValidPlayerName(state.names[0])) {
      markNameValidity(false, t("name_need_start"));
    } else {
      markNameValidity(true);
    }
    loadCoins();
    ensureBestStageEpoch();
    syncMyScoreToBoards();
    pullServerBoardIntoLocal();
  }

  function loadAvatar() {
    try {
      const raw = localStorage.getItem(AVATAR_KEY);
      if (!raw) return { ...DEFAULT_AVATAR };
      const d = JSON.parse(raw);
      if (!d || typeof d !== "object") return { ...DEFAULT_AVATAR };
      return {
        skin: AVATAR_SKINS.includes(d.skin) ? d.skin : DEFAULT_AVATAR.skin,
        body: AVATAR_BODIES.includes(d.body) ? d.body : DEFAULT_AVATAR.body,
        hair: AVATAR_HAIR_STYLES.some((h) => h.id === d.hair)
          ? d.hair
          : DEFAULT_AVATAR.hair,
        hairColor: AVATAR_HAIR_COLORS.includes(d.hairColor)
          ? d.hairColor
          : DEFAULT_AVATAR.hairColor,
      };
    } catch (_) {
      return { ...DEFAULT_AVATAR };
    }
  }

  function saveAvatar(av) {
    avatarDraft = { ...av };
    try {
      localStorage.setItem(AVATAR_KEY, JSON.stringify(av));
    } catch (_) {}
    // Live-update current player if mid-game
    if (state.players && state.players[0] && !state.players[0].frozen) {
      applyAvatarToPlayer(state.players[0], av);
    }
    drawAvatarPreviews();
  }

  function avatarToPalette(av) {
    return {
      body: av.body,
      skin: av.skin,
      eye: "#ffffff",
      pupil: "#1a1a1a",
      accent: "#f0b429",
      hair: av.hair,
      hairColor: av.hairColor,
    };
  }

  function applyAvatarToPlayer(p, av) {
    if (!p) return;
    const pal = avatarToPalette(av || loadAvatar());
    p.palette = pal;
    p.hair = pal.hair;
    p.hairColor = pal.hairColor;
  }

  function paletteForPlayerId(id) {
    if (id === 0) return avatarToPalette(loadAvatar());
    return { ...P2_PALETTE, hair: "short", hairColor: "#5c3317" };
  }

  function drawHairOnCtx(c, scale, hair, hairColor, facing) {
    if (!hair || hair === "none") return;
    const col = hairColor || "#1a1a1a";
    c.fillStyle = col;
    if (hair === "short") {
      c.beginPath();
      c.ellipse(0, -16 * scale, 9.5 * scale, 5 * scale, 0, Math.PI, 0);
      c.fill();
    } else if (hair === "long") {
      c.beginPath();
      c.ellipse(0, -15 * scale, 9.2 * scale, 5.5 * scale, 0, Math.PI, 0);
      c.fill();
      c.fillRect(-10 * scale, -12 * scale, 4 * scale, 14 * scale);
      c.fillRect(6 * scale, -12 * scale, 4 * scale, 14 * scale);
    } else if (hair === "curly") {
      for (const [ox, oy, r] of [
        [-5, -18, 4.2],
        [0, -20, 4.5],
        [5, -18, 4.2],
        [-7, -14, 3.2],
        [7, -14, 3.2],
      ]) {
        c.beginPath();
        c.arc(ox * scale, oy * scale, r * scale, 0, Math.PI * 2);
        c.fill();
      }
    } else if (hair === "spikes") {
      // Spiky mohawk / porcupine tips
      c.beginPath();
      c.ellipse(0, -15.5 * scale, 8.5 * scale, 4 * scale, 0, Math.PI, 0);
      c.fill();
      for (const [ox, tipY] of [
        [-6, -26],
        [-3, -28],
        [0, -30],
        [3, -28],
        [6, -26],
      ]) {
        c.beginPath();
        c.moveTo((ox - 2.2) * scale, -16 * scale);
        c.lineTo(ox * scale, tipY * scale);
        c.lineTo((ox + 2.2) * scale, -16 * scale);
        c.closePath();
        c.fill();
      }
    } else if (hair === "rock") {
      // Rock: tall volume + side swoop
      c.beginPath();
      c.ellipse(0, -17 * scale, 10 * scale, 7 * scale, 0, Math.PI, 0);
      c.fill();
      c.beginPath();
      c.moveTo(-10 * scale, -14 * scale);
      c.quadraticCurveTo(-14 * scale, -22 * scale, -2 * scale, -26 * scale);
      c.quadraticCurveTo(4 * scale, -28 * scale, 8 * scale, -20 * scale);
      c.quadraticCurveTo(11 * scale, -16 * scale, 9 * scale, -12 * scale);
      c.lineTo(6 * scale, -14 * scale);
      c.closePath();
      c.fill();
      // bangs over forehead
      c.beginPath();
      c.moveTo(-7 * scale, -14 * scale);
      c.quadraticCurveTo(-2 * scale, -8 * scale, 3 * scale, -14 * scale);
      c.fill();
    } else if (hair === "fade") {
      // Fade / דירוג: short sides, fuller top
      c.globalAlpha = 0.35;
      c.fillRect(-9.5 * scale, -14 * scale, 3.5 * scale, 8 * scale);
      c.fillRect(6 * scale, -14 * scale, 3.5 * scale, 8 * scale);
      c.globalAlpha = 0.55;
      c.fillRect(-9 * scale, -15 * scale, 3 * scale, 5 * scale);
      c.fillRect(6 * scale, -15 * scale, 3 * scale, 5 * scale);
      c.globalAlpha = 1;
      c.beginPath();
      c.ellipse(0, -16 * scale, 8 * scale, 5.5 * scale, 0, Math.PI, 0);
      c.fill();
      // neat top fringe
      c.beginPath();
      c.moveTo(-6 * scale, -13 * scale);
      c.quadraticCurveTo(0, -10 * scale, 6 * scale, -13 * scale);
      c.quadraticCurveTo(0, -15 * scale, -6 * scale, -13 * scale);
      c.fill();
    } else if (hair === "cap") {
      // Baseball cap sitting on top of the head, brim to the right
      c.fillStyle = col;
      // soft hair under the cap (so it sits on the skull)
      c.beginPath();
      c.ellipse(0, -16 * scale, 8.5 * scale, 4 * scale, 0, Math.PI, 0);
      c.fill();
      c.save();
      // crown centered on the crown of the head
      c.translate(1.5 * scale, -18.5 * scale);
      c.rotate(0.12);
      c.beginPath();
      c.ellipse(0, 0, 9 * scale, 5 * scale, 0, Math.PI, Math.PI * 2);
      c.fill();
      c.fillRect(-9 * scale, -1 * scale, 18 * scale, 4 * scale);
      // rounded front of crown
      c.beginPath();
      c.ellipse(0, 2.5 * scale, 8.5 * scale, 2.2 * scale, 0, 0, Math.PI);
      c.fill();
      // brim to the right, above the eyes
      c.beginPath();
      c.ellipse(10 * scale, 2 * scale, 6.5 * scale, 2 * scale, 0.08, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
  }

  function drawCharacterToCtx(c, ent, palette, scale = 1) {
    const { facing } = ent;
    const bob = Math.sin(ent.bob || 0) * 1.5;
    c.save();
    c.translate(ent.x, ent.y + bob);
    c.scale(facing || 1, 1);

    c.fillStyle = "rgba(0,0,0,0.35)";
    c.beginPath();
    c.ellipse(0, 12 * scale, 9 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = palette.body;
    const bw = 16 * scale;
    const bh = 16 * scale;
    c.fillRect(-bw / 2, -6 * scale, bw, bh);

    c.fillStyle = palette.skin;
    c.beginPath();
    c.arc(0, -12 * scale, 9 * scale, 0, Math.PI * 2);
    c.fill();

    drawHairOnCtx(
      c,
      scale,
      palette.hair || ent.hair,
      palette.hairColor || ent.hairColor,
      facing || 1
    );

    c.fillStyle = palette.eye;
    c.beginPath();
    c.arc(-3.5 * scale, -13 * scale, 2.2 * scale, 0, Math.PI * 2);
    c.arc(3.5 * scale, -13 * scale, 2.2 * scale, 0, Math.PI * 2);
    c.fill();

    if (palette.pupil) {
      c.fillStyle = palette.pupil;
      c.beginPath();
      c.arc(-3.5 * scale, -13 * scale, 1 * scale, 0, Math.PI * 2);
      c.arc(3.5 * scale, -13 * scale, 1 * scale, 0, Math.PI * 2);
      c.fill();
    }

    if (palette.accent) {
      c.fillStyle = palette.accent;
      c.fillRect(-10 * scale, -4 * scale, 4 * scale, 10 * scale);
    }

    c.restore();
  }

  function drawAvatarOnCanvas(canvasEl, av, scale) {
    if (!canvasEl) return;
    const c = canvasEl.getContext("2d");
    if (!c) return;
    const w = canvasEl.width;
    const h = canvasEl.height;
    c.clearRect(0, 0, w, h);
    const pal = avatarToPalette(av || loadAvatar());
    drawCharacterToCtx(
      c,
      { x: w / 2, y: h * 0.62, facing: 1, bob: 0 },
      pal,
      scale || 2.2
    );
  }

  function drawAvatarPreviews() {
    drawAvatarOnCanvas(
      document.getElementById("avatarPreview"),
      avatarDraft,
      2.4
    );
    drawAvatarOnCanvas(
      document.getElementById("menuAvatarPreview"),
      loadAvatar(),
      1.15
    );
  }

  function buildAvatarPicker() {
    const skinRow = document.getElementById("avatarSkinRow");
    const bodyRow = document.getElementById("avatarBodyRow");
    const hairRow = document.getElementById("avatarHairRow");
    const hairColorRow = document.getElementById("avatarHairColorRow");
    if (!skinRow || !bodyRow || !hairRow || !hairColorRow) return;

    function fillSwatches(row, colors, key) {
      row.innerHTML = "";
      colors.forEach((col) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "swatch-btn" + (avatarDraft[key] === col ? " on" : "");
        btn.style.background = col;
        btn.setAttribute("aria-label", col);
        btn.onclick = () => {
          avatarDraft[key] = col;
          fillSwatches(row, colors, key);
          if (key === "hairColor") buildHairButtons();
          drawAvatarPreviews();
        };
        row.appendChild(btn);
      });
    }

    function buildHairButtons() {
      hairRow.innerHTML = "";
      AVATAR_HAIR_STYLES.forEach((h) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hair-btn" + (avatarDraft.hair === h.id ? " on" : "");
        btn.textContent = t(h.labelKey);
        btn.onclick = () => {
          avatarDraft.hair = h.id;
          buildHairButtons();
          drawAvatarPreviews();
        };
        hairRow.appendChild(btn);
      });
    }

    fillSwatches(skinRow, AVATAR_SKINS, "skin");
    fillSwatches(bodyRow, AVATAR_BODIES, "body");
    fillSwatches(hairColorRow, AVATAR_HAIR_COLORS, "hairColor");
    buildHairButtons();
  }

  function loadCoins() {
    try {
      const n = parseInt(localStorage.getItem(COINS_KEY) || "0", 10);
      state.coins = Number.isFinite(n) && n > 0 ? n : 0;
    } catch (_) {
      state.coins = 0;
    }
    syncCoinUi();
    if (state.coins > 0) {
      upsertLocalBoard(boardPlayerName(), state.coins);
    }
  }

  function saveCoins() {
    try {
      localStorage.setItem(COINS_KEY, String(state.coins));
    } catch (_) {}
    syncCoinUi();
  }

  function syncCoinUi() {
    if (coinStatusEl) coinStatusEl.textContent = `🪙 ${state.coins}`;
    if (menuCoinsEl) menuCoinsEl.textContent = t("coins_yours", { n: state.coins });
    syncContinueUi();
  }

  function canSaveCampaign() {
    return (
      !state.creator &&
      !state.online &&
      state.playMode === "solo"
    );
  }

  function readCampaignSave() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      const worldIndex = Math.max(
        0,
        Math.min(
          (typeof WORLDS !== "undefined" ? WORLDS.length : 5) - 1,
          data.worldIndex | 0
        )
      );
      const levelIndex = Math.max(
        0,
        Math.min(LEVELS_PER_WORLD - 1, data.levelIndex | 0)
      );
      let lives = data.lives | 0;
      if (lives < 1) lives = 1;
      if (lives > 3) lives = 3;
      // Ignore empty fresh saves at very start with full lives? Keep them so continue works after story.
      return {
        worldIndex,
        levelIndex,
        lives,
        introDone: !!data.introDone,
        cloudStorySeen: !!data.cloudStorySeen,
        updatedAt: data.updatedAt || 0,
      };
    } catch (_) {
      return null;
    }
  }

  function saveCampaignProgress(override) {
    if (!canSaveCampaign()) return;
    try {
      const o = override || {};
      const livesRaw =
        o.lives != null ? o.lives | 0 : state.lives | 0;
      // Never persist a game-over run as "continue with 1 life"
      if (livesRaw <= 0 && o.lives == null) {
        clearCampaignProgress();
        return;
      }
      const payload = {
        worldIndex:
          o.worldIndex != null ? o.worldIndex | 0 : state.worldIndex | 0,
        levelIndex:
          o.levelIndex != null ? o.levelIndex | 0 : state.levelIndex | 0,
        lives: Math.max(1, Math.min(3, livesRaw)),
        introDone: true,
        cloudStorySeen:
          o.cloudStorySeen != null
            ? !!o.cloudStorySeen
            : !!(() => {
                const prev = readCampaignSave();
                return prev && prev.cloudStorySeen;
              })(),
        updatedAt: Date.now(),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
      recordBestStage(payload.worldIndex, payload.levelIndex);
    } catch (_) {}
    syncContinueUi();
  }

  function clearCampaignProgress() {
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch (_) {}
    syncContinueUi();
  }

  function formatSaveLabel(save) {
    if (!save) return "";
    const world = worldLabel(save.worldIndex);
    const isBoss = save.levelIndex >= LEVELS_PER_WORLD - 1;
    const stage = isBoss
      ? t("stage_boss")
      : t("stage_n", { n: save.levelIndex + 1 });
    return `${world} · ${stage} · ${"❤️".repeat(save.lives)}`;
  }

  function syncContinueUi() {
    const continueBtn = document.getElementById("continueBtn");
    const continueHint = document.getElementById("continueHint");
    const newGameBtn = document.getElementById("newGameBtn");
    const onePlayerBtn = document.getElementById("onePlayerBtn");
    const save = readCampaignSave();
    const has = !!save;
    if (continueBtn) continueBtn.hidden = !has;
    if (continueHint) {
      continueHint.hidden = !has;
      continueHint.textContent = has
        ? t("saved_as", { label: formatSaveLabel(save) })
        : "";
    }
    if (newGameBtn) newGameBtn.hidden = !has;
    if (onePlayerBtn) {
      onePlayerBtn.hidden = has;
    }
  }

  function continueCampaign() {
    if (!requireValidP1Name()) return;
    const save = readCampaignSave();
    if (!save) {
      startGame("solo", false);
      return;
    }
    state.playMode = "solo";
    state.creator = false;
    state.online = false;
    state.onlineRole = null;
    state.versusWinner = null;
    state.versusScore = [0, 0];
    state.versusFinal = false;
    state.lives = save.lives;
    setCreatorTools(false);
    document.getElementById("againBtn").textContent = t("play_again");

    // If they reached world 2 without watching the cloud story, show it now
    if (
      save.worldIndex === 1 &&
      save.levelIndex === 0 &&
      !save.cloudStorySeen
    ) {
      state.worldIndex = 0;
      openWorldBridgeStory();
      return;
    }

    state.worldIndex = save.worldIndex;
    introLevel(save.levelIndex);
  }

  function startFreshSolo() {
    if (!requireValidP1Name()) return;
    clearCampaignProgress();
    startGame("solo", false);
  }

  let coinToastEl = null;
  let coinToastTimer = null;
  function showCoinToast(amount) {
    if (!coinToastEl) {
      coinToastEl = document.createElement("div");
      coinToastEl.className = "coin-toast";
      document.body.appendChild(coinToastEl);
    }
    coinToastEl.textContent = `🪙 +${amount}`;
    coinToastEl.classList.add("show");
    clearTimeout(coinToastTimer);
    coinToastTimer = setTimeout(() => {
      coinToastEl.classList.remove("show");
    }, 1400);
  }

  function awardCoins(amount) {
    const add = Math.max(0, Math.floor(amount || 0));
    if (add <= 0) return;
    state.coins += add;
    saveCoins();
    showCoinToast(add);
    sfx("coin");
    syncMyScoreToBoards();
  }

  function clearedLevelId(worldIndex, levelIndex) {
    return `${worldIndex | 0}:${levelIndex | 0}`;
  }

  function loadClearedLevels() {
    try {
      const raw = localStorage.getItem(CLEARED_LEVELS_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return data && typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch (_) {
      return {};
    }
  }

  function hasClearedLevel(worldIndex, levelIndex) {
    return !!loadClearedLevels()[clearedLevelId(worldIndex, levelIndex)];
  }

  function markLevelCleared(worldIndex, levelIndex) {
    try {
      const map = loadClearedLevels();
      map[clearedLevelId(worldIndex, levelIndex)] = 1;
      localStorage.setItem(CLEARED_LEVELS_KEY, JSON.stringify(map));
    } catch (_) {}
    recordBestStage(worldIndex, levelIndex);
  }

  function levelsPerWorld() {
    return typeof LEVELS_PER_WORLD !== "undefined" ? LEVELS_PER_WORLD : 11;
  }

  function progressScore(worldIndex, levelIndex) {
    const l = levelIndex == null ? -1 : levelIndex | 0;
    if (l < 0) return -1;
    return (worldIndex | 0) * levelsPerWorld() + l;
  }

  function ensureBestStageEpoch() {
    try {
      const cur = parseInt(
        localStorage.getItem(BEST_STAGE_EPOCH_KEY) || "0",
        10
      );
      if (cur >= BEST_STAGE_EPOCH) return;
      localStorage.removeItem(BEST_STAGE_KEY);
      const entries = loadLocalBoard().map((e) => ({
        ...e,
        bestWorld: 0,
        bestLevel: -1,
      }));
      saveLocalBoard(entries);
      localStorage.setItem(BEST_STAGE_EPOCH_KEY, String(BEST_STAGE_EPOCH));
    } catch (_) {}
  }

  function readBestStage() {
    try {
      const raw = localStorage.getItem(BEST_STAGE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (d && typeof d === "object") {
        return {
          worldIndex: Math.max(0, d.worldIndex | 0),
          levelIndex: Math.max(0, d.levelIndex | 0),
        };
      }
    } catch (_) {}
    return null;
  }

  function recordBestStage(worldIndex, levelIndex) {
    // Creator / versus must never set the public "best stage" record
    if (state.creator || state.playMode === "versus") return readBestStage();
    const w = Math.max(0, worldIndex | 0);
    const l = Math.max(0, levelIndex | 0);
    const cur = readBestStage();
    if (
      cur &&
      progressScore(cur.worldIndex, cur.levelIndex) >= progressScore(w, l)
    ) {
      return cur;
    }
    const next = { worldIndex: w, levelIndex: l };
    try {
      localStorage.setItem(BEST_STAGE_KEY, JSON.stringify(next));
    } catch (_) {}
    return next;
  }

  function formatStageLabel(worldIndex, levelIndex) {
    if (worldIndex == null || levelIndex == null || levelIndex < 0) {
      return t("lb_stage_none");
    }
    const w = (worldIndex | 0) + 1;
    const l = levelIndex | 0;
    if (l >= levelsPerWorld() - 1) return t("lb_stage_boss", { w });
    return t("lb_stage", { w, l: l + 1 });
  }

  function myBestStagePayload() {
    let best = readBestStage();
    if (
      state.playMode === "solo" &&
      !state.creator &&
      state.worldIndex != null &&
      state.levelIndex != null
    ) {
      best = recordBestStage(state.worldIndex, state.levelIndex) || best;
    }
    if (!best) return { bestWorld: 0, bestLevel: -1 };
    return { bestWorld: best.worldIndex | 0, bestLevel: best.levelIndex | 0 };
  }

  function boardPlayerName() {
    const id = state.online ? localPlayerId() : 0;
    const fromState = (state.names[id] || state.names[0] || "").trim();
    const fromInput =
      (nameInputP1 && nameInputP1.value && nameInputP1.value.trim()) || "";
    const fromOnline =
      (window.OnlineNet && OnlineNet.name && String(OnlineNet.name).trim()) ||
      "";
    const raw = fromState || fromOnline || fromInput || t("player");
    // Match server normalize: ensure usable display name
    let n = raw.slice(0, 15);
    if (digitCount(n) !== 3) {
      const base = n.replace(/\d/g, "").trim() || t("player");
      const digits = (n.match(/\d/g) || []).join("").slice(0, 3).padEnd(3, "0");
      n = (base + digits).slice(0, 15);
    }
    return n;
  }

  function loadLocalBoard() {
    try {
      const raw = localStorage.getItem(LOCAL_BOARD_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.entries)) return data.entries;
    } catch (_) {}
    return [];
  }

  function saveLocalBoard(entries) {
    try {
      localStorage.setItem(
        LOCAL_BOARD_KEY,
        JSON.stringify({ entries: entries.slice(0, LEADERBOARD_SIZE) })
      );
    } catch (_) {}
  }

  function sortBoardEntries(entries) {
    return entries
      .slice()
      .sort(
        (a, b) =>
          b.coins - a.coins ||
          String(a.name).localeCompare(String(b.name), "he")
      )
      .slice(0, LEADERBOARD_SIZE);
  }

  function upsertLocalBoard(name, coins, stage) {
    const n = String(name || "").trim();
    if (!n) return loadLocalBoard();
    const c = Math.max(0, Math.floor(Number(coins) || 0));
    let entries = loadLocalBoard();
    const existing = entries.find(
      (e) => e.name && e.name.toLowerCase() === n.toLowerCase()
    );
    const bestWorld =
      stage && stage.bestWorld != null
        ? stage.bestWorld | 0
        : stage && stage.worldIndex != null
          ? stage.worldIndex | 0
          : null;
    const bestLevel =
      stage && stage.bestLevel != null
        ? stage.bestLevel | 0
        : stage && stage.levelIndex != null
          ? stage.levelIndex | 0
          : null;
    if (existing) {
      if (c > existing.coins) existing.coins = c;
      if (bestWorld != null && bestLevel != null && bestLevel >= 0) {
        if (
          progressScore(bestWorld, bestLevel) >
          progressScore(existing.bestWorld | 0, existing.bestLevel ?? -1)
        ) {
          existing.bestWorld = bestWorld;
          existing.bestLevel = bestLevel;
        }
      }
      existing.updatedAt = Date.now();
    } else {
      const row = { name: n, coins: c, updatedAt: Date.now() };
      if (bestWorld != null && bestLevel != null && bestLevel >= 0) {
        row.bestWorld = bestWorld;
        row.bestLevel = bestLevel;
      }
      entries.push(row);
    }
    entries = sortBoardEntries(entries);
    saveLocalBoard(entries);
    return entries;
  }

  function mergeBoardEntries(a, b) {
    const map = new Map();
    for (const list of [a || [], b || []]) {
      for (const e of list) {
        if (!e || !e.name) continue;
        const key = String(e.name).toLowerCase();
        const coins = Math.max(0, Math.floor(Number(e.coins) || 0));
        const bestWorld = e.bestWorld | 0;
        const bestLevel =
          e.bestLevel == null || e.bestLevel < 0 ? -1 : e.bestLevel | 0;
        const prev = map.get(key);
        if (!prev) {
          map.set(key, {
            name: e.name,
            coins,
            bestWorld: bestLevel >= 0 ? bestWorld : 0,
            bestLevel,
          });
          continue;
        }
        if (coins > prev.coins) prev.coins = coins;
        if (
          bestLevel >= 0 &&
          progressScore(bestWorld, bestLevel) >
            progressScore(prev.bestWorld | 0, prev.bestLevel ?? -1)
        ) {
          prev.bestWorld = bestWorld;
          prev.bestLevel = bestLevel;
        }
      }
    }
    return sortBoardEntries([...map.values()]);
  }

  function boardPayloadFromEntries(entries, focusName) {
    const sorted = sortBoardEntries(entries || []);
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
    return {
      size: LEADERBOARD_SIZE,
      rows,
      myRank,
      count: sorted.length,
    };
  }

  function syncMyScoreToBoards() {
    const rawName =
      (state.online
        ? state.names[localPlayerId()] ||
          (window.OnlineNet && OnlineNet.name) ||
          state.names[0]
        : state.names[0]) || "";
    if (!isValidPlayerName(rawName) && !isValidPlayerName(state.names[0])) {
      return;
    }
    const name = boardPlayerName();
    const stage = myBestStagePayload();
    upsertLocalBoard(name, state.coins, stage);
    submitCoinsToServer();
  }

  async function submitCoinsToServer() {
    const rawName =
      (state.online
        ? state.names[localPlayerId()] ||
          (window.OnlineNet && OnlineNet.name) ||
          state.names[0]
        : state.names[0]) || "";
    if (
      !isValidPlayerName(rawName) &&
      !isValidPlayerName(state.names[0])
    ) {
      return null;
    }
    const name = boardPlayerName();
    if (!name) return null;
    const stage = myBestStagePayload();
    try {
      const res = await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          coins: state.coins,
          bestWorld: stage.bestWorld,
          bestLevel: stage.bestLevel,
          stageEpoch: BEST_STAGE_EPOCH,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  /** Upload everyone this device knows, then return server board. */
  async function pushLocalBoardToServer() {
    const name = isValidPlayerName(state.names[0]) ? boardPlayerName() : "";
    const stage = myBestStagePayload();
    if (name) upsertLocalBoard(name, state.coins, stage);
    // Also register P2 if valid (same-screen coop)
    if (isValidPlayerName(state.names[1])) {
      upsertLocalBoard(state.names[1].trim().slice(0, 15), 0);
    }
    const entries = loadLocalBoard()
      .filter((e) => e && e.name)
      .map((e) => ({
        name: e.name,
        coins: Math.max(0, Math.floor(Number(e.coins) || 0)),
        bestWorld: e.bestWorld | 0,
        bestLevel: e.bestLevel == null ? -1 : e.bestLevel | 0,
      }));
    if (!entries.length && !name) return null;
    if (name && !entries.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      entries.push({
        name,
        coins: state.coins,
        bestWorld: stage.bestWorld,
        bestLevel: stage.bestLevel,
      });
    }
    try {
      const res = await fetch("/api/coins/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries,
          name,
          stageEpoch: BEST_STAGE_EPOCH,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  async function fetchLeaderboard() {
    const name = isValidPlayerName(state.names[0]) ? boardPlayerName() : "";
    const q = name ? `?name=${encodeURIComponent(name)}` : "";
    try {
      const res = await fetch(`/api/coins${q}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  async function pullServerBoardIntoLocal() {
    // First push everything this device knows, then pull full shared board
    let serverFetched = await pushLocalBoardToServer();
    if (!serverFetched) serverFetched = await fetchLeaderboard();
    if (!serverFetched || !Array.isArray(serverFetched.rows)) return null;
    const fromServer = serverFetched.rows
      .filter((r) => r && r.name)
      .map((r) => ({
        name: r.name,
        coins: Number(r.coins) || 0,
        bestWorld: r.bestWorld | 0,
        bestLevel: r.bestLevel == null ? -1 : r.bestLevel | 0,
      }));
    const merged = mergeBoardEntries(loadLocalBoard(), fromServer);
    saveLocalBoard(merged);
    return { merged, serverFetched };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLeaderboard(data) {
    if (!leaderboardListEl) return;
    leaderboardListEl.innerHTML = "";
    const myName = boardPlayerName().toLowerCase();
    const myBest = myBestStagePayload();
    if (leaderboardMeEl) {
      const stageTxt = formatStageLabel(myBest.bestWorld, myBest.bestLevel);
      leaderboardMeEl.textContent =
        data && data.myRank
          ? t("lb_me_rank_stage", {
              n: state.coins,
              r: data.myRank,
              s: stageTxt,
            })
          : t("lb_me_stage", { n: state.coins, s: stageTxt });
    }
    if (leaderboardHintEl) {
      if (data && data.offline) {
        leaderboardHintEl.textContent = t("lb_offline");
      } else if (data && data.count != null) {
        leaderboardHintEl.textContent = t("lb_hint_n", { n: data.count });
      } else {
        leaderboardHintEl.textContent = t("lb_hint");
      }
    }
    // Only show real players — never pad with 200 empty slots
    const rows = (
      data && Array.isArray(data.rows) ? data.rows : []
    ).filter((row) => row && row.name);
    const frag = document.createDocumentFragment();
    if (!rows.length) {
      const el = document.createElement("div");
      el.className = "lb-row is-empty";
      el.innerHTML = `<span class="lb-rank">—</span><span class="lb-name">${escapeHtml(
        t("lb_none")
      )}</span><span class="lb-stage">—</span><span class="lb-coins">—</span>`;
      frag.appendChild(el);
    } else {
      rows.forEach((row, i) => {
        const el = document.createElement("div");
        const isMe = row.name.toLowerCase() === myName;
        el.className = "lb-row" + (isMe ? " is-me" : "");
        const rank = row.rank != null ? row.rank : i + 1;
        const stageTxt = formatStageLabel(row.bestWorld, row.bestLevel);
        el.innerHTML = `<span class="lb-rank">${rank}</span><span class="lb-name">${escapeHtml(
          row.name
        )}</span><span class="lb-stage">${escapeHtml(
          stageTxt
        )}</span><span class="lb-coins">🪙 ${row.coins}</span>`;
        frag.appendChild(el);
      });
    }
    leaderboardListEl.appendChild(frag);
    const meRow = leaderboardListEl.querySelector(".lb-row.is-me");
    if (meRow) meRow.scrollIntoView({ block: "center" });
  }

  /** Remember anyone seen in the online lobby so they appear on the board. */
  function absorbOnlinePlayersIntoBoard() {
    if (!window.OnlineNet || !Array.isArray(OnlineNet.players)) return;
    for (const p of OnlineNet.players) {
      if (p && p.name && isValidPlayerName(p.name)) {
        upsertLocalBoard(String(p.name).trim().slice(0, 15), 0);
      }
    }
  }

  async function openLeaderboard() {
    syncCoinUi();
    absorbOnlinePlayersIntoBoard();
    const name = isValidPlayerName(state.names[0]) ? boardPlayerName() : "";
    let entries = name
      ? upsertLocalBoard(name, state.coins)
      : loadLocalBoard();

    // Show known players immediately
    renderLeaderboard(boardPayloadFromEntries(entries, name));
    showScreen("leaderboard");

    const pulled = await pullServerBoardIntoLocal();
    if (pulled) {
      entries = pulled.merged;
      renderLeaderboard(boardPayloadFromEntries(entries, name));
    } else {
      const offline = boardPayloadFromEntries(entries, name);
      offline.offline = true;
      renderLeaderboard(offline);
    }
  }

  function digitCount(s) {
    return (String(s).match(/\d/g) || []).length;
  }

  function hasExactly3Digits(s) {
    return digitCount(s) === 3;
  }

  function hasNameLetters(s) {
    return /[A-Za-z\u0590-\u05FF]/.test(String(s || ""));
  }

  /** Must type a real name + exactly 3 digits (e.g. דני847) */
  function isValidPlayerName(s) {
    const t = String(s || "").trim();
    if (t.length < 4) return false;
    if (!hasNameLetters(t)) return false;
    if (!hasExactly3Digits(t)) return false;
    return true;
  }

  function sanitizeName(raw, fallback) {
    let t = (raw || "").trim().replace(/\s+/g, " ").slice(0, 15);
    if (!t && fallback !== undefined) t = fallback;
    return t;
  }

  function nameHintEl() {
    return document.getElementById("nameHintP1");
  }

  function syncMenuNameLine() {
    const line = document.getElementById("menuNameLine");
    if (!line) return;
    const n = (state.names[0] || "").trim();
    if (n && isValidPlayerName(n)) {
      line.textContent = t("name_hello", { n });
    } else if (n) {
      line.textContent = t("name_bad", { n });
    } else {
      line.textContent = t("name_unset");
    }
    syncCreatorAccess();
    drawAvatarPreviews();
  }

  function openSettings(focusName) {
    if (nameInputP1) nameInputP1.value = state.names[0] || "";
    avatarDraft = loadAvatar();
    buildAvatarPicker();
    drawAvatarPreviews();
    syncMuteBtn();
    if (window.I18n) I18n.apply();
    buildAvatarPicker(); // rebuild labels after i18n
    showScreen("settings");
    if (focusName && nameInputP1) {
      requestAnimationFrame(() => {
        nameInputP1.focus();
        nameInputP1.select();
      });
    }
  }

  function saveSettingsName() {
    if (!requireValidP1Name(true)) return;
    syncMenuNameLine();
    syncMyScoreToBoards();
    saveAvatar(avatarDraft);
    showScreen("menu");
    syncContinueUi();
  }

  function isCreatorAllowed() {
    return false;
  }

  function syncCreatorAccess() {
    const btn = document.getElementById("creatorBtn");
    if (!btn) return;
    btn.hidden = true;
    btn.classList.add("hidden");
    if (state.creator && state.mode === "menu") {
      state.creator = false;
      setCreatorTools(false);
    }
  }

  function markNameValidity(ok, message) {
    if (nameInputP1) nameInputP1.classList.toggle("invalid", !ok);
    if (nameInputP1b) nameInputP1b.classList.toggle("invalid", !ok);
    const hint = nameHintEl();
    if (hint) {
      hint.classList.toggle("bad", !ok);
      hint.textContent =
        message || t("name_hint");
    }
    syncMenuNameLine();
  }

  /** Returns true if P1 typed a valid name. */
  function requireValidP1Name(stayOnSettings) {
    const raw =
      (nameInputP1 && nameInputP1.value) ||
      (nameInputP1b && nameInputP1b.value) ||
      state.names[0] ||
      "";
    const n1 = sanitizeName(raw, "");
    state.names[0] = n1;
    if (nameInputP1) nameInputP1.value = n1;
    if (nameInputP1b) nameInputP1b.value = n1;

    const goFix = () => {
      if (stayOnSettings) {
        showScreen("settings");
        if (nameInputP1) nameInputP1.focus();
      } else {
        openSettings(true);
      }
    };

    if (!n1) {
      markNameValidity(false, t("name_required"));
      goFix();
      return false;
    }
    if (!hasNameLetters(n1)) {
      markNameValidity(false, t("name_letters"));
      goFix();
      return false;
    }
    if (!hasExactly3Digits(n1)) {
      markNameValidity(false, t("name_digits", { n: digitCount(n1) }));
      goFix();
      return false;
    }

    try {
      localStorage.setItem(NAME_KEY_P1, n1);
    } catch (_) {
      /* ignore */
    }
    syncNameLabels();
    syncMenuNameLine();
    markNameValidity(true, t("name_saved"));
    if (window.OnlineNet && OnlineNet.connected) OnlineNet.setName(n1);
    return true;
  }

  function saveNamesFromInputs() {
    const n1 = sanitizeName(
      (nameInputP1 && nameInputP1.value) ||
        (nameInputP1b && nameInputP1b.value) ||
        "",
      ""
    );
    const n2 = sanitizeName(
      (nameInputP2 && nameInputP2.value) || "",
      ""
    );
    state.names[0] = n1;
    state.names[1] = n2;
    try {
      if (n1) localStorage.setItem(NAME_KEY_P1, n1);
      if (n2) localStorage.setItem(NAME_KEY_P2, n2);
    } catch (_) {
      /* ignore */
    }
    if (nameInputP1) nameInputP1.value = n1;
    if (nameInputP1b) nameInputP1b.value = n1;
    if (nameInputP2) nameInputP2.value = n2;
    syncNameLabels();
    if (window.OnlineNet && OnlineNet.connected && n1) {
      OnlineNet.setName(n1);
    }
    if (!n1) {
      markNameValidity(false, t("name_need"));
    } else if (!isValidPlayerName(n1)) {
      markNameValidity(
        false,
        t("name_digits", { n: digitCount(n1) })
      );
    } else {
      markNameValidity(true);
    }
  }

  function playerName(id) {
    const n = state.names[id];
    if (n && n.trim()) return n.trim();
    return id === 0 ? t("player") : t("player2");
  }

  function myDisplayName() {
    if (state.online) {
      const n = playerName(localPlayerId());
      if (n && n !== "Player" && n !== "Player 2" && n !== "שחקן" && n !== "שחקן 2") return n;
      if (window.OnlineNet && OnlineNet.name) return OnlineNet.name;
    }
    return playerName(0);
  }

  function syncNameLabels() {
    if (state.online) {
      // On each device show THIS player's name on the visible stick
      if (padLabel1) padLabel1.textContent = myDisplayName();
      if (padLabel2) padLabel2.textContent = playerName(1 - localPlayerId());
      return;
    }
    if (padLabel1) padLabel1.textContent = playerName(0);
    if (padLabel2) padLabel2.textContent = playerName(1);
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== name);
    });
  }

  function hideAllScreens() {
    Object.values(screens).forEach((el) => el.classList.add("hidden"));
  }

  function hideControls() {
    controls.hidden = true;
  }

  function isDual() {
    return state.playMode === "coop" || state.playMode === "versus";
  }

  function isOnlineGuest() {
    return state.online && state.onlineRole === "guest";
  }

  function isOnlineHost() {
    return state.online && state.onlineRole === "host";
  }

  function localPlayerId() {
    return state.online ? state.myPlayerId : 0;
  }

  function playerCount() {
    return isDual() ? 2 : 1;
  }

  function alivePlayers() {
    return state.players.filter((p) => !p.eliminated);
  }

  function activeChaseTargets() {
    return state.players.filter((p) => !p.eliminated && !p.frozen);
  }

  function nearestPlayer(ent, list) {
    let best = null;
    let bestD = Infinity;
    for (const p of list) {
      const d = dist(ent, p);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  function sfx(name, ...args) {
    try {
      if (window.Sfx && typeof Sfx[name] === "function") Sfx[name](...args);
    } catch (_) {
      /* ignore */
    }
  }

  function syncMuteBtn() {
    if (!window.Sfx) return;
    const label = Sfx.isMuted() ? t("mute_off") : t("mute_on");
    const btn = document.getElementById("muteBtn");
    if (btn) btn.textContent = label;
    const settingsMute = document.getElementById("settingsMuteBtn");
    if (settingsMute) settingsMute.textContent = label;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.dpr = dpr;
    const box = playfield || canvas;
    const rect = box.getBoundingClientRect();
    let w = Math.max(1, Math.floor(rect.width || window.innerWidth));
    let h = Math.max(1, Math.floor(rect.height || window.innerHeight));
    // Fallback before layout settles
    if (h < 80) {
      w = Math.min(window.innerWidth, 480);
      h = Math.max(200, window.innerHeight - 120);
    }
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    // Fit the whole court on phone; on larger screens allow a bit of zoom
    const mapW = ((state.level && state.level.width) || 15) * (state.tileSize || 32);
    const mapH = ((state.level && state.level.height) || 22) * (state.tileSize || 32);
    const fit = Math.min(w / mapW, h / mapH) * 0.96; // slight margin
    const phone = Math.min(window.innerWidth, window.innerHeight) < 500 || w <= 480;
    if (phone) {
      // Always show the full map on mobile
      state.renderScale = Math.max(0.32, Math.min(0.85, fit));
    } else {
      state.renderScale = Math.max(0.5, Math.min(1.1, fit > 1 ? Math.min(1.05, fit) : fit));
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function viewSize() {
    const scale = state.renderScale || 1;
    return {
      viewW: canvas.clientWidth / scale,
      viewH: canvas.clientHeight / scale,
      scale,
    };
  }

  function tileAt(tx, ty) {
    const m = state.level.map;
    if (ty < 0 || tx < 0 || ty >= m.length || tx >= m[0].length) return TILE.WALL;
    return m[ty][tx];
  }

  function isSolid(t) {
    return t === TILE.WALL;
  }

  function worldToTile(x, y) {
    const ts = state.tileSize;
    return { tx: Math.floor(x / ts), ty: Math.floor(y / ts) };
  }

  function collides(x, y, r) {
    const points = [
      [x - r, y - r],
      [x + r, y - r],
      [x - r, y + r],
      [x + r, y + r],
    ];
    return points.some(([px, py]) => {
      const { tx, ty } = worldToTile(px, py);
      return isSolid(tileAt(tx, ty));
    });
  }

  function findTiles(type) {
    const out = [];
    const m = state.level.map;
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] === type) out.push({ x, y });
      }
    }
    return out;
  }

  function clearTileType(type) {
    const m = state.level.map;
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] === type) m[y][x] = TILE.EMPTY;
      }
    }
  }

  function spawnBurst(x, y, color, n = 10) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.5 + Math.random() * 2.5;
      state.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 30 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function makePlayer(id, x, y, speed, palette) {
    const pal = palette || paletteForPlayerId(id);
    return {
      id,
      x,
      y,
      r: 10,
      speed,
      facing: 1,
      bob: 0,
      invuln: 90,
      frozen: false,
      eliminated: false,
      atExit: false,
      bookCd: 0,
      lastAimX: 1,
      lastAimY: 0,
      input: { x: 0, y: 0 },
      slowTimer: 0,
      rootTimer: 0,
      heldSabotage: null,
      palette: pal,
      hair: pal.hair || "none",
      hairColor: pal.hairColor || "#1a1a1a",
    };
  }

  function spawnSabotageItems() {
    state.sabotageItems = [];
    if (state.playMode !== "versus") return;

    const empties = [];
    const m = state.level.map;
    const ts = state.tileSize;
    for (let y = 1; y < m.length - 1; y++) {
      for (let x = 1; x < m[y].length - 1; x++) {
        if (m[y][x] === TILE.EMPTY) empties.push({ x, y });
      }
    }
    for (let i = empties.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [empties[i], empties[j]] = [empties[j], empties[i]];
    }
    // More sabotage on duel maps
    const count = 5 + (state.levelIndex % 3);
    for (let i = 0; i < count && i < empties.length; i++) {
      const cell = empties[i];
      const kind = SABOTAGE_KINDS[i % SABOTAGE_KINDS.length];
      state.sabotageItems.push({
        x: cell.x * ts + ts / 2,
        y: cell.y * ts + ts / 2,
        emoji: kind.emoji,
        slow: kind.slow,
      });
    }
  }

  function loadLevel(index) {
    const src =
      state.playMode === "versus"
        ? makeVersusLevel(index)
        : makeCampaignLevel(state.worldIndex, index);
    state.level = src;
    state.levelIndex = index;
    if (typeof src.worldIndex === "number") state.worldIndex = src.worldIndex;
    state.keys = 0;
    state.keysNeeded = src.keysNeeded;
    state.zombies = [];
    state.boss = null;
    state.particles = [];
    state.books = [];
    state.notes = [];
    state.sabotageProjs = [];
    state.time = 0;
    state.versusWinner = null;
    state.versusFinal = false;

    const ts = state.tileSize;
    const spawn1 = findTiles(TILE.SPAWN)[0] || { x: 1, y: 1 };
    const spawn2tile = findTiles(TILE.SPAWN2)[0];
    const sx = spawn1.x * ts + ts / 2;
    const sy = spawn1.y * ts + ts / 2;

    state.players = [];
    state.players.push(
      makePlayer(0, sx, sy, src.playerSpeed, paletteForPlayerId(0))
    );

    if (playerCount() === 2) {
      let p2x;
      let p2y;
      if (spawn2tile) {
        p2x = spawn2tile.x * ts + ts / 2;
        p2y = spawn2tile.y * ts + ts / 2;
      } else {
        const rightTx = spawn1.x + 1;
        if (!isSolid(tileAt(rightTx, spawn1.y))) {
          p2x = rightTx * ts + ts / 2;
          p2y = spawn1.y * ts + ts / 2;
        } else {
          p2x = sx + 12;
          p2y = sy;
        }
      }
      state.players.push(
        makePlayer(1, p2x, p2y, src.playerSpeed, paletteForPlayerId(1))
      );
    }
    clearTileType(TILE.SPAWN);
    clearTileType(TILE.SPAWN2);

    findTiles(TILE.ZOMBIE).forEach((z, i) => {
      state.zombies.push({
        x: z.x * ts + ts / 2,
        y: z.y * ts + ts / 2,
        r: 11,
        speed: src.zombieSpeed * (0.85 + (i % 3) * 0.08),
        facing: 1,
        wait: 20 + i * 8,
        stun: 0,
        kind: "teacher",
      });
    });
    clearTileType(TILE.ZOMBIE);

    const bossTile = findTiles(TILE.BOSS)[0];
    if (bossTile) {
      state.boss = {
        x: bossTile.x * ts + ts / 2,
        y: bossTile.y * ts + ts / 2,
        r: 22,
        speed: 1.55,
        facing: 1,
        chargeTimer: 120,
        noteTimer: 70,
        charging: false,
        vx: 0,
        vy: 0,
        hpFlash: 0,
        stun: 0,
        bossType: src.bossType || "principal",
      };
      clearTileType(TILE.BOSS);
    }

    spawnSabotageItems();
    updateHud();
    updateBookUi();
    resize();
  }

  function hasBooks() {
    // Co-op / versus: books from the start so both players can use them
    if (isDual()) return true;
    // Solo / creator: unlock from world 1 level 5, then keep forever
    if ((state.worldIndex || 0) > 0) return true;
    return state.levelIndex >= BOOK_UNLOCK_LEVEL;
  }

  function canThrow(p) {
    if (!p || p.frozen || p.eliminated) return false;
    if (p.heldSabotage) return true;
    return hasBooks() && p.bookCd <= 0;
  }

  function updateBookUi() {
    const playing =
      state.mode === "play" || state.mode === "pause" || state.mode === "fail";
    const showBooks = hasBooks() && playing && state.level;
    bookHud.hidden = !showBooks;

    const anyReady = state.players.some(
      (p) => !p.eliminated && !p.frozen && p.bookCd <= 0
    );
    const anyCd = state.players.some((p) => p.bookCd > 0);
    if (bookStatusEl) {
      if (!hasBooks()) {
        bookStatusEl.textContent = "";
      } else if (anyReady) {
        bookStatusEl.textContent = t("book_ready");
      } else if (anyCd) {
        const maxCd = Math.max(0, ...state.players.map((p) => p.bookCd));
        bookStatusEl.textContent = t("book_cd", {
          n: Math.ceil(maxCd / 60),
        });
      } else {
        bookStatusEl.textContent = "📖";
      }
    }

    state.players.forEach((p) => {
      const ring = p.id === 0 ? throwRing1 : throwRing2;
      const btn = p.id === 0 ? throwBtn1 : throwBtn2;
      if (!ring || !btn) return;

      const showThrow =
        state.mode === "play" &&
        !p.eliminated &&
        !p.frozen &&
        (!!p.heldSabotage || hasBooks());

      btn.hidden = !showThrow;
      btn.disabled = false; // never disable — blocks touch on mobile
      btn.classList.toggle("is-charging", !p.heldSabotage && p.bookCd > 0);

      const icon = btn.querySelector(".throw-icon");
      if (icon) {
        if (p.heldSabotage) {
          icon.textContent = p.heldSabotage.emoji;
          ring.style.setProperty("--charge", "100%");
        } else if (hasBooks()) {
          icon.textContent = "📖";
          const ready = p.bookCd <= 0;
          const charge = ready ? 100 : Math.round((1 - p.bookCd / BOOK_COOLDOWN) * 100);
          ring.style.setProperty("--charge", charge + "%");
        }
      }
    });

    if (!isDual() && throwBtn2) {
      throwBtn2.hidden = true;
    }
  }

  function updateHud() {
    const isBoss =
      state.level && state.level.isBoss
        ? true
        : state.levelIndex === LEVELS_PER_WORLD - 1;
    const world =
      typeof WORLDS !== "undefined" ? WORLDS[state.worldIndex] : null;
    if (world && state.playMode !== "versus") {
      levelNumEl.textContent =
        (isBoss ? t("stage_boss") : String(state.levelIndex + 1)) +
        ` · ${state.worldIndex + 1}`;
    } else if (isBoss) {
      levelNumEl.textContent = t("stage_boss");
    } else {
      levelNumEl.textContent = String(state.levelIndex + 1);
    }

    if (state.creator) {
      livesEl.textContent = t("lives_creator");
    } else if (state.playMode === "solo") {
      livesEl.textContent = "❤️".repeat(Math.max(0, state.lives)) || "💀";
    } else {
      const bits = state.players.map((p) => {
        const nm = playerName(p.id);
        if (p.eliminated) return `${nm}💀`;
        if (p.frozen) return `${nm}❄️`;
        return `${nm}✅`;
      });
      livesEl.textContent = bits.join(" ");
    }

    if (state.keys >= state.keysNeeded) {
      keyStatusEl.textContent = t("key_ready");
    } else {
      keyStatusEl.textContent = t("key_count", {
        a: state.keys,
        b: state.keysNeeded,
      });
    }

    if (state.playMode === "coop") {
      modeHud.hidden = false;
      modeStatusEl.textContent = t("mode_coop");
    } else if (state.playMode === "versus") {
      modeHud.hidden = false;
      const [a, b] = state.versusScore;
      modeStatusEl.textContent = `⚔️ ${a}-${b} · ${state.levelIndex + 1}/${VERSUS_LEVEL_COUNT}`;
    } else {
      modeHud.hidden = true;
    }

    syncCoinUi();
  }

  function setCreatorTools(on) {
    document.getElementById("skipBtn").classList.toggle("hidden", !on);
    document.getElementById("pickLevelBtn").classList.toggle("hidden", !on);
  }

  function syncControlPads() {
    if (state.online) {
      // One local pad controlling this device's player
      controls.classList.add("solo");
      if (throwBtn1 && controls) {
        controls.appendChild(throwBtn1);
        throwBtn1.classList.add("throw-solo-right");
      }
      padP1.hidden = false;
      padP1.classList.remove("hidden");
      padP2.hidden = true;
      padP2.classList.add("hidden");
      if (throwBtn2) throwBtn2.hidden = true;
      if (padLabel1) padLabel1.textContent = myDisplayName();
      return;
    }
    if (isDual()) {
      controls.classList.remove("solo");
      // Restore throw button next to P1 stick
      if (throwBtn1 && padP1 && throwBtn1.parentElement !== padP1) {
        padP1.insertBefore(throwBtn1, padP1.firstChild);
      }
      throwBtn1.classList.remove("throw-solo-right");
      padP1.hidden = false;
      padP2.hidden = false;
      padP1.classList.remove("hidden");
      padP2.classList.remove("hidden");
    } else {
      controls.classList.add("solo");
      padP1.hidden = false;
      padP1.classList.remove("hidden");
      // Book on the right, independent of left stick
      if (throwBtn1 && controls) {
        controls.appendChild(throwBtn1);
        throwBtn1.classList.add("throw-solo-right");
      }
      padP2.hidden = true;
      padP2.classList.add("hidden");
      if (throwBtn2) throwBtn2.hidden = true;
      if (knob2) knob2.style.transform = "translate(-50%, -50%)";
    }
  }

  let creatorWorldPick = 0;

  function buildWorldTabs() {
    const tabs = document.getElementById("worldTabs");
    if (!tabs || typeof WORLDS === "undefined") return;
    tabs.innerHTML = "";
    WORLDS.forEach((w, wi) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "world-tab" + (wi === creatorWorldPick ? " on" : "");
      btn.textContent = t("world_n", { n: wi + 1 });
      btn.title = worldLabel(wi);
      btn.addEventListener("click", () => {
        creatorWorldPick = wi;
        buildWorldTabs();
        buildLevelGrid();
      });
      tabs.appendChild(btn);
    });
  }

  function buildLevelGrid() {
    const grid = document.getElementById("levelGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const wi = creatorWorldPick;
    const metas =
      typeof WORLD_LEVEL_METAS !== "undefined" && WORLD_LEVEL_METAS[wi]
        ? WORLD_LEVEL_METAS[wi]
        : LEVEL_META;
    const world = WORLDS[wi];
    metas.forEach((meta, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const isBoss = i === LEVELS_PER_WORLD - 1;
      btn.className = "level-pick" + (isBoss ? " boss" : "");
      const label = isBoss ? t("stage_boss") : String(i + 1);
      const loc = localizeMeta(meta);
      const name =
        isBoss && world ? bossLabel(wi) : loc.name;
      btn.innerHTML = `<span class="num">${label}</span>${name}`;
      btn.addEventListener("click", () => startCreatorAt(wi, i));
      grid.appendChild(btn);
    });
  }

  function openCreatorSelect() {
    if (!isCreatorAllowed()) {
      syncCreatorAccess();
      showScreen("menu");
      return;
    }
    state.creator = true;
    state.lives = Infinity;
    if (!state.playMode) state.playMode = "solo";
    setCreatorTools(true);
    state.mode = "menu";
    creatorWorldPick = Math.min(state.worldIndex || 0, WORLDS.length - 1);
    buildWorldTabs();
    buildLevelGrid();
    showScreen("creator");
    setPlayChrome(false);
    hideControls();
  }

  const STORY_PAGES = [
    {
      titleKey: "story1_title",
      image: "assets/story/story-1-arrive.png",
      textKey: "story1_text",
    },
    {
      titleKey: "story2_title",
      image: "assets/story/story-2-bell.png",
      textKey: "story2_text",
    },
    {
      titleKey: "story3_title",
      image: "assets/story/story-3-zombies.png",
      textKey: "story3_text",
    },
    {
      titleKey: "story4_title",
      image: "assets/story/story-4-panic.png",
      textKey: "story4_text",
    },
    {
      titleKey: "story5_title",
      image: "assets/story/story-5-escape.png",
      textKey: "story5_text",
    },
  ];

  const CLOUD_STORY_PAGES = [
    {
      titleKey: "cloud1_title",
      image: "assets/story/story-cloud-monster.png",
      textKey: "cloud1_text",
    },
    {
      titleKey: "cloud2_title",
      image: "assets/story/story-cloud-monster.png",
      textKey: "cloud2_text",
    },
    {
      titleKey: "cloud3_title",
      image: "assets/story/story-4-panic.png",
      textKey: "cloud3_text",
    },
    {
      titleKey: "cloud4_title",
      image: "assets/story/story-5-escape.png",
      textKey: "cloud4_text",
    },
    {
      titleKey: "cloud5_title",
      image: "assets/story/story-1-arrive.png",
      textKey: "cloud5_text",
    },
  ];

  function worldBridgePages(fromWorld) {
    const next = WORLDS[fromWorld + 1];
    const nextName = next ? worldLabel(fromWorld + 1) : t("next_world");
    const boss = next ? bossLabel(fromWorld + 1) : t("stage_boss");
    const hints = {
      music: t("hint_music"),
      sports: t("hint_sports"),
      chem: t("hint_chem"),
      cloud: t("hint_cloud"),
    };
    const hint = (next && hints[next.bossType]) || t("hint_boss");
    return [
      {
        titleKey: "bridge_cloud_title",
        image: "assets/story/story-cloud-monster.png",
        textKey: "bridge_cloud_text",
      },
      {
        titleKey: "bridge_path_title",
        image: "assets/story/story-5-escape.png",
        textKey: "bridge_path_text",
      },
      {
        title: nextName,
        image: "assets/story/story-1-arrive.png",
        text: () =>
          t("bridge_enter_text", { next: nextName, boss, hint }),
      },
    ];
  }

  let storyIndex = 0;
  let storyPendingStart = null; // { mode, creator }
  let activeStoryPages = STORY_PAGES;
  let storyKind = "intro"; // intro | bridge

  function renderStoryPage() {
    const pages = activeStoryPages;
    const page = pages[storyIndex];
    const name = playerName(0);
    const title = page.titleKey ? t(page.titleKey) : page.title;
    const text = page.textKey
      ? t(page.textKey, { n: name })
      : typeof page.text === "function"
        ? page.text(name)
        : page.text || "";
    document.getElementById("storyStep").textContent = `${storyIndex + 1} / ${pages.length}`;
    document.getElementById("storyTitle").textContent = title;
    document.getElementById("storyText").textContent = text;
    const art = document.getElementById("storyArt");
    if (art) {
      art.src = page.image;
      art.alt = title;
    }
    const nextBtn = document.getElementById("storyNext");
    if (nextBtn) {
      if (storyKind === "bridge") {
        nextBtn.textContent =
          storyIndex >= pages.length - 1
            ? t("story_next_world")
            : t("story_next");
      } else {
        nextBtn.textContent =
          storyIndex >= pages.length - 1 ? t("story_flee") : t("story_next");
      }
    }
    const dots = document.getElementById("storyDots");
    if (dots) {
      dots.innerHTML = "";
      pages.forEach((_, i) => {
        const d = document.createElement("span");
        d.className = "story-dot" + (i === storyIndex ? " on" : "");
        dots.appendChild(d);
      });
    }
    sfx("storyPage");
  }

  function finishStoryAndStart() {
    if (storyKind === "bridge") {
      storyKind = "intro";
      activeStoryPages = STORY_PAGES;
      storyPendingStart = null;
      // Mark cloud story seen when leaving world-0 bridge
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          data.cloudStorySeen = true;
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
        }
      } catch (_) {}
      state.worldIndex += 1;
      if (state.worldIndex >= WORLDS.length) {
        setCampaignWin(true);
        return;
      }
      state.lives = Math.max(state.lives, 3);
      introLevel(0);
      return;
    }
    storyPendingStart = null;
    state.mode = "intro";
    state.worldIndex = 0;
    introLevel(0);
  }

  function openWorldBridgeStory() {
    storyKind = "bridge";
    // After world 0 use the long cloud story; later worlds use shorter bridges
    activeStoryPages =
      state.worldIndex === 0
        ? CLOUD_STORY_PAGES
        : worldBridgePages(state.worldIndex);
    storyIndex = 0;
    state.mode = "story";
    setPlayChrome(false);
    hideControls();
    if (coinToastEl) coinToastEl.classList.remove("show");
    // Boss cleared — if they quit during the story, resume at the next world
    if (state.worldIndex < WORLDS.length - 1) {
      saveCampaignProgress({
        worldIndex: state.worldIndex + 1,
        levelIndex: 0,
        lives: Math.max(3, state.lives | 0),
        cloudStorySeen: state.worldIndex === 0 ? false : true,
      });
    }
    activeStoryPages.forEach((p) => {
      const img = new Image();
      img.src = p.image;
    });
    renderStoryPage();
    showScreen("story");
    // Force image paint (helps on some mobile browsers)
    const art = document.getElementById("storyArt");
    if (art && activeStoryPages[0]) {
      art.src = activeStoryPages[0].image + "?v=" + Date.now();
    }
    sfx("storyPage");
  }

  function openStoryThenStart(mode, creator = false) {
    storyKind = "intro";
    activeStoryPages = STORY_PAGES;
    storyPendingStart = { mode, creator };
    storyIndex = 0;
    state.mode = "story";
    state.worldIndex = 0;
    setPlayChrome(false);
    hideControls();
    STORY_PAGES.forEach((p) => {
      const img = new Image();
      img.src = p.image;
    });
    renderStoryPage();
    showScreen("story");
  }

  function startGame(mode, creator = false) {
    const onlineMatch = !!state.online;
    if (creator && !isCreatorAllowed()) {
      syncCreatorAccess();
      return;
    }
    if (!onlineMatch && !requireValidP1Name()) return;
    if (!onlineMatch && (mode === "coop" || mode === "versus")) {
      const n2 = sanitizeName(
        (nameInputP2 && nameInputP2.value) || state.names[1] || "",
        ""
      );
      state.names[1] = n2;
      if (!isValidPlayerName(n2)) {
        markNameValidity(false, t("name_p2"));
        if (nameInputP2) {
          nameInputP2.classList.add("invalid");
          nameInputP2.focus();
        }
        return;
      }
      try {
        localStorage.setItem(NAME_KEY_P2, n2);
      } catch (_) {}
    }
    // Online: keep hostName/guestName from room_start — never overwrite with local P2 field
    if (onlineMatch) {
      const mine =
        (window.OnlineNet && OnlineNet.name) ||
        state.names[state.myPlayerId] ||
        state.names[0];
      if (mine && isValidPlayerName(mine)) {
        state.names[state.myPlayerId] = mine;
      }
    }
    syncMyScoreToBoards();
    state.playMode = mode || "solo";
    state.creator = creator;
    state.lives = creator ? Infinity : 3;
    state.worldIndex = 0;
    state.versusWinner = null;
    state.versusScore = [0, 0];
    state.versusFinal = false;
    if (!creator && mode === "solo" && !onlineMatch) clearCampaignProgress();
    document.getElementById("againBtn").textContent = t("play_again");
    setCreatorTools(creator);
    syncNameLabels();
    // Story only on fresh campaign-style starts (not creator level pick)
    if (!creator && (mode === "solo" || mode === "coop" || mode === "versus")) {
      openStoryThenStart(mode, creator);
      return;
    }
    introLevel(0);
  }

  function startCreatorAt(worldIndex, levelIndex) {
    if (!isCreatorAllowed()) {
      syncCreatorAccess();
      showScreen("menu");
      return;
    }
    state.creator = true;
    state.lives = Infinity;
    state.worldIndex = worldIndex;
    creatorWorldPick = worldIndex;
    if (!state.playMode) state.playMode = "solo";
    setCreatorTools(true);
    introLevel(levelIndex);
  }

  function introLevel(index) {
    state.mode = "intro";
    loadLevel(index);
    const meta =
      state.playMode === "versus"
        ? localizeMeta(VERSUS_META[index])
        : campaignMeta(state.worldIndex, index);
    const maxLv =
      state.playMode === "versus" ? VERSUS_LEVEL_COUNT : LEVELS_PER_WORLD;
    const world = WORLDS[state.worldIndex];
    const isBoss =
      state.playMode !== "versus" && index === LEVELS_PER_WORLD - 1;
    const wName = world ? worldLabel(state.worldIndex) : "";
    document.getElementById("levelTitleLabel").textContent =
      state.playMode === "versus"
        ? t("duel", { a: index + 1, b: maxLv })
        : isBoss
          ? t("world_boss", { w: wName })
          : t("world_stage", {
              w: wName,
              a: index + 1,
              b: maxLv - 1,
            });
    document.getElementById("levelTitle").textContent =
      isBoss && world ? bossLabel(state.worldIndex) : meta.name;
    let desc = meta.desc;
    if (state.playMode === "coop") {
      desc += t("coop_door_hint");
    } else if (state.playMode === "versus") {
      const [a, b] = state.versusScore;
      desc += t("score_now", { a, b });
    }
    if (state.online) {
      desc += isOnlineGuest()
        ? t("wait_host_start")
        : t("you_host_go");
    }
    document.getElementById("levelDesc").textContent = desc;
    const goBtn = document.getElementById("levelGo");
    if (goBtn) {
      goBtn.hidden = isOnlineGuest();
      goBtn.textContent = t("level_go");
    }
    showScreen("level");
    setPlayChrome(false);
    hideControls();
    saveCampaignProgress();
    if (isOnlineHost()) {
      netSendEvent({
        event: "intro",
        levelIndex: index,
        playMode: state.playMode,
        versusScore: state.versusScore.slice(),
        names: state.names.slice(),
      });
    }
  }

  function setPlayChrome(on) {
    if (topbar) topbar.hidden = !on;
    if (hud) hud.hidden = !on;
    if (pauseBtn) pauseBtn.hidden = !on;
    if (!on) sfx("stopMusic");
  }

  function isBossLevel() {
    return (
      state.playMode !== "versus" &&
      ((state.level && state.level.isBoss) ||
        state.levelIndex === LEVELS_PER_WORLD - 1)
    );
  }

  function beginPlay() {
    state.mode = "play";
    // Clear any leftover root/freeze from a previous attempt
    for (const p of state.players || []) {
      p.rootTimer = 0;
      if (state.playMode === "solo") p.frozen = false;
    }
    hideAllScreens();
    setPlayChrome(true);
    controls.hidden = false;
    syncControlPads();
    updateHud();
    updateBookUi();
    requestAnimationFrame(() => resize());
    sfx(isBossLevel() ? "startBossPlay" : "startPlay", state.worldIndex || 0);
    if (isOnlineHost()) {
      netSendEvent({ event: "play", levelIndex: state.levelIndex });
      netBroadcastState(true);
    }
  }

  function fail(reason) {
    sfx("fail");
    state.mode = "fail";
    if (!state.creator && state.playMode === "solo") {
      state.lives -= 1;
    }
    updateHud();
    const failTitle = document.getElementById("failTitle");
    if (failTitle) {
      failTitle.textContent =
        state.playMode === "coop" ? t("fail_coop") : t("fail_title");
    }
    const wName = worldLabel(state.worldIndex);
    document.getElementById("failMsg").textContent = state.creator
      ? t("fail_creator", { r: reason })
      : state.playMode === "solo" && state.lives <= 0
        ? t("fail_lives", { w: wName })
        : reason;
    document.getElementById("retryBtn").textContent =
      state.creator || state.playMode !== "solo" || state.lives > 0
        ? t("retry")
        : t("restart_world");
    showScreen("fail");
    setPlayChrome(true);
    if (pauseBtn) pauseBtn.hidden = true;
    hideControls();
    if (isOnlineHost()) {
      netSendEvent({
        event: "fail",
        reason,
        lives: state.lives,
        levelIndex: state.levelIndex,
        worldIndex: state.worldIndex,
      });
    }
    if (!state.creator && state.playMode === "solo" && state.lives <= 0) {
      // Game over — no "continue" with leftover lives on the same stage
      clearCampaignProgress();
    } else {
      saveCampaignProgress();
    }
  }

  function setCampaignWin(finalAll = false) {
    sfx("win");
    state.mode = "win";
    if (finalAll) {
      document.getElementById("winEyebrow").textContent = t("win_big");
      document.getElementById("winTitle").textContent = t("win_friends");
      document.getElementById("winMsg").textContent = t("win_friends_msg");
    } else {
      document.getElementById("winEyebrow").textContent = t("win_eyebrow");
      document.getElementById("winTitle").textContent = t("win_world");
      document.getElementById("winMsg").textContent =
        state.playMode === "coop" ? t("win_coop") : t("win_boss_next");
    }
    document.getElementById("againBtn").textContent = t("play_again");
    showScreen("win");
    setPlayChrome(false);
    hideControls();
    if (isOnlineHost()) {
      netSendEvent({
        event: "campaign_win",
        playMode: state.playMode,
        finalAll: !!finalAll,
      });
    }
    if (finalAll) clearCampaignProgress();
  }

  function versusWin(winner) {
    sfx(state.levelIndex >= VERSUS_LEVEL_COUNT - 1 ? "win" : "levelClear");
    state.versusScore[winner.id] += 1;
    state.versusWinner = winner;
    const [a, b] = state.versusScore;
    const isLast = state.levelIndex >= VERSUS_LEVEL_COUNT - 1;

    if (!isLast) {
      state.mode = "win";
      state.versusFinal = false;
      document.getElementById("winEyebrow").textContent = t("round_n", { n: state.levelIndex + 1 });
      document.getElementById("winTitle").textContent = t("round_won", { n: playerName(winner.id) });
      document.getElementById("winMsg").textContent = t("round_score", { a, b });
      document.getElementById("againBtn").textContent = t("next_round");
      showScreen("win");
      setPlayChrome(false);
      hideControls();
      if (isOnlineHost()) {
        netSendEvent({
          event: "versus_round",
          winnerId: winner.id,
          versusScore: [a, b],
          levelIndex: state.levelIndex,
          final: false,
        });
      }
      return;
    }

    // Tournament finished
    state.mode = "win";
    state.versusFinal = true;
    let champId = winner.id;
    if (a > b) champId = 0;
    else if (b > a) champId = 1;
    document.getElementById("winEyebrow").textContent = t("championship");
    document.getElementById("winTitle").textContent = t("champ", { n: playerName(champId) });
    document.getElementById("winMsg").textContent =
      t("tourney_over", { a, b });
    document.getElementById("againBtn").textContent = t("new_game_btn");
    showScreen("win");
    setPlayChrome(false);
    hideControls();
    if (isOnlineHost()) {
      netSendEvent({
        event: "versus_round",
        winnerId: winner.id,
        versusScore: [a, b],
        levelIndex: state.levelIndex,
        final: true,
        champId,
      });
    }
  }

  function completeLevel() {
    const ref = state.players.find((p) => !p.eliminated) || state.players[0];
    if (ref) spawnBurst(ref.x, ref.y, "#3ecf8e", 18);

    if (state.playMode === "versus") {
      // handled elsewhere
    }

    const isBoss =
      (state.level && state.level.isBoss) ||
      (!state.creator &&
        state.playMode !== "versus" &&
        state.levelIndex >= LEVELS_PER_WORLD - 1);

    // Coins: first clear +3 / boss +10; replay of same stage +2. Skip creator/versus.
    if (!state.creator && state.playMode !== "versus") {
      const w = state.worldIndex | 0;
      const l = state.levelIndex | 0;
      const replay = hasClearedLevel(w, l);
      awardCoins(replay ? COIN_REPLAY : isBoss ? COIN_BOSS : COIN_LEVEL);
      markLevelCleared(w, l);
    }

    if (state.creator) {
      if (state.levelIndex >= LEVELS_PER_WORLD - 1) {
        // After world-1 boss, still show the cloud story
        if (state.worldIndex === 0) {
          openWorldBridgeStory();
          return;
        }
        if (state.worldIndex < WORLDS.length - 1) {
          state.worldIndex += 1;
          sfx("levelClear");
          introLevel(0);
        } else {
          openCreatorSelect();
        }
        return;
      }
      sfx("levelClear");
      introLevel(state.levelIndex + 1);
      return;
    }

    if (isBoss) {
      // After world boss: cloud / bridge story → next world, or final win
      if (state.worldIndex >= WORLDS.length - 1) {
        sfx("win");
        setCampaignWin(true);
        return;
      }
      openWorldBridgeStory();
      return;
    }

    sfx("levelClear");
    introLevel(state.levelIndex + 1);
  }

  function tryMove(ent, dx, dy) {
    const nx = ent.x + dx;
    const ny = ent.y + dy;
    if (!collides(nx, ent.y, ent.r * 0.85)) ent.x = nx;
    if (!collides(ent.x, ny, ent.r * 0.85)) ent.y = ny;
    if (Math.abs(dx) > 0.05) ent.facing = dx > 0 ? 1 : -1;
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function chase(ent, target, speed) {
    const dx = target.x - ent.x;
    const dy = target.y - ent.y;
    const d = Math.hypot(dx, dy) || 1;
    tryMove(ent, (dx / d) * speed, (dy / d) * speed);
  }

  function smartChase(ent, target, speed) {
    if (!target) return;
    const ts = state.tileSize;
    const start = worldToTile(ent.x, ent.y);
    const goal = worldToTile(target.x, target.y);
    if (start.tx === goal.tx && start.ty === goal.ty) {
      chase(ent, target, speed);
      return;
    }

    const key = (x, y) => x + "," + y;
    const q = [[start.tx, start.ty]];
    const came = new Map();
    came.set(key(start.tx, start.ty), null);
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    let found = null;
    let guard = 0;

    while (q.length && guard++ < 220) {
      const [cx, cy] = q.shift();
      if (cx === goal.tx && cy === goal.ty) {
        found = [cx, cy];
        break;
      }
      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        const k = key(nx, ny);
        if (came.has(k)) continue;
        if (isSolid(tileAt(nx, ny))) continue;
        came.set(k, [cx, cy]);
        q.push([nx, ny]);
      }
    }

    if (!found) {
      chase(ent, target, speed * 0.7);
      return;
    }

    let cur = found;
    let prev = came.get(key(cur[0], cur[1]));
    while (prev) {
      const pkey = key(prev[0], prev[1]);
      if (prev[0] === start.tx && prev[1] === start.ty) break;
      cur = prev;
      prev = came.get(pkey);
    }

    const tx = cur[0] * ts + ts / 2;
    const ty = cur[1] * ts + ts / 2;
    chase(ent, { x: tx, y: ty }, speed);
  }

  const pressed = new Set();

  function keyActive(...names) {
    return names.some((n) => pressed.has(n));
  }

  function keyboardInputFor(p) {
    // Online guest's character is driven by remote input on the host
    if (isOnlineHost() && p.id === 1) {
      return { ix: p.input.x, iy: p.input.y };
    }
    // Online: only local player's keyboard
    if (state.online && p.id !== localPlayerId()) {
      return { ix: p.input.x, iy: p.input.y };
    }

    let ix = p.input.x;
    let iy = p.input.y;
    const useWasd = !state.online || p.id === localPlayerId();
    if (p.id === 0 || (state.online && useWasd && p.id === localPlayerId())) {
      // Physical WASD via e.code + Hebrew letters that sit on those keys
      // W → ' on Hebrew layout (sometimes reported as Quote)
      if (keyActive("KeyA", "a", "A", "ש")) ix -= 1;
      if (keyActive("KeyD", "d", "D", "ג")) ix += 1;
      if (keyActive("KeyW", "w", "W", "Quote", "'", "׳")) iy -= 1;
      if (keyActive("KeyS", "s", "S", "ד")) iy += 1;
    } else if (!state.online && p.id === 1) {
      if (keyActive("ArrowLeft")) ix -= 1;
      if (keyActive("ArrowRight")) ix += 1;
      if (keyActive("ArrowUp")) iy -= 1;
      if (keyActive("ArrowDown")) iy += 1;
    }
    return { ix, iy };
  }

  function updatePlayers() {
    let exited = false;

    for (const p of state.players) {
      if (p.eliminated) {
        p.atExit = false;
        continue;
      }
      if (p.invuln > 0) p.invuln -= 1;
      if (p.bookCd > 0) {
        p.bookCd -= 1;
        // Bing when the shot finishes recharging
        if (p.bookCd === 0 && hasBooks()) sfx("bing");
      }
      if (p.slowTimer > 0) p.slowTimer -= 1;
      if (p.rootTimer > 0) {
        p.rootTimer -= 1;
        if (p.rootTimer === 0) {
          // Brief escape window so overlapping boss/shots don't re-lock forever
          p.invuln = Math.max(p.invuln || 0, 90);
        }
      }

      if (p.frozen || (p.rootTimer | 0) > 0) {
        p.atExit = false;
        continue;
      }

      let { ix, iy } = keyboardInputFor(p);
      const len = Math.hypot(ix, iy);
      if (len > 1) {
        ix /= len;
        iy /= len;
      }

      const speedMul = p.slowTimer > 0 ? 0.45 : 1;
      tryMove(p, ix * p.speed * speedMul, iy * p.speed * speedMul);
      if (len > 0.1) {
        p.bob += 0.35;
        p.lastAimX = ix;
        p.lastAimY = iy;
      } else if (p.facing) {
        p.lastAimX = p.facing;
        p.lastAimY = 0;
      }

      // Sabotage pickup
      if (state.playMode === "versus" && !p.heldSabotage) {
        for (let i = state.sabotageItems.length - 1; i >= 0; i--) {
          const item = state.sabotageItems[i];
          if (dist(p, item) < 16) {
            p.heldSabotage = { emoji: item.emoji, slow: item.slow };
            state.sabotageItems.splice(i, 1);
            spawnBurst(p.x, p.y, "#f0b429", 8);
            updateBookUi();
            break;
          }
        }
      }

      const { tx, ty } = worldToTile(p.x, p.y);
      const t = tileAt(tx, ty);
      if (t === TILE.KEY) {
        state.level.map[ty][tx] = TILE.EMPTY;
        state.keys += 1;
        spawnBurst(p.x, p.y, "#f0b429", 14);
        updateHud();
        sfx("keyPickup");
      }

      const onExit = t === TILE.EXIT && state.keys >= state.keysNeeded;
      p.atExit = onExit;

      if (state.playMode === "versus" && onExit) {
        versusWin(p);
        exited = true;
        break;
      }
    }

    if (exited) return;

    // Co-op revive
    if (state.playMode === "coop") {
      for (const frozen of state.players) {
        if (!frozen.frozen || frozen.eliminated) continue;
        for (const other of state.players) {
          if (other === frozen || other.frozen || other.eliminated) continue;
          if (dist(frozen, other) < REVIVE_DIST) {
            frozen.frozen = false;
            frozen.invuln = 90;
            spawnBurst(frozen.x, frozen.y, "#7ec8ff", 12);
            updateHud();
            sfx("revive");
          }
        }
      }
    }

    // Exit completion
    if (state.playMode === "solo") {
      const p = state.players[0];
      if (p && p.atExit) completeLevel();
    } else if (state.playMode === "coop") {
      const living = alivePlayers();
      if (living.length && living.every((p) => p.atExit)) {
        completeLevel();
      }
    }
  }

  function nearestEnemyFor(p) {
    let best = null;
    let bestD = Infinity;
    for (const z of state.zombies) {
      if (z.stun > 0) continue;
      const d = dist(p, z);
      if (d < bestD) {
        bestD = d;
        best = z;
      }
    }
    if (state.boss && state.boss.stun <= 0) {
      const d = dist(p, state.boss);
      if (d < bestD) {
        bestD = d;
        best = state.boss;
      }
    }
    return best;
  }

  function throwSabotage(p) {
    if (!p.heldSabotage || state.mode !== "play") return;
    const other = state.players.find((o) => o.id !== p.id && !o.eliminated);
    if (!other) return;
    let dx = other.x - p.x;
    let dy = other.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    p.lastAimX = dx;
    p.lastAimY = dy;
    state.sabotageProjs.push({
      x: p.x + dx * 14,
      y: p.y + dy * 14,
      vx: dx * SABOTAGE_SPEED,
      vy: dy * SABOTAGE_SPEED,
      r: 9,
      life: 120,
      emoji: p.heldSabotage.emoji,
      slow: p.heldSabotage.slow,
      ownerId: p.id,
      target: other,
    });
    p.heldSabotage = null;
    spawnBurst(p.x, p.y, "#e8a040", 6);
    updateBookUi();
    sfx("sabotageThrow");
  }

  function throwBook(p) {
    if (!p || state.mode !== "play" || p.frozen || p.eliminated) return;

    if (p.heldSabotage) {
      throwSabotage(p);
      return;
    }

    if (!hasBooks() || p.bookCd > 0) return;

    const target = nearestEnemyFor(p);
    let dx = p.lastAimX;
    let dy = p.lastAimY;
    if (target) {
      dx = target.x - p.x;
      dy = target.y - p.y;
    }
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    p.lastAimX = dx;
    p.lastAimY = dy;
    state.books.push({
      x: p.x + dx * 14,
      y: p.y + dy * 14,
      vx: dx * BOOK_SPEED,
      vy: dy * BOOK_SPEED,
      r: 8,
      life: 110,
      rot: 0,
      target,
      ownerId: p.id,
    });
    p.bookCd = BOOK_COOLDOWN;
    spawnBurst(p.x, p.y, "#c9a227", 6);
    updateBookUi();
    sfx("throwBook");
  }

  function updateSabotageProjs() {
    state.sabotageProjs = state.sabotageProjs.filter((b) => {
      const target =
        b.target && !b.target.eliminated
          ? b.target
          : state.players.find((p) => p.id !== b.ownerId && !p.eliminated);
      b.target = target || null;
      if (target) {
        const dx = target.x - b.x;
        const dy = target.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        b.vx = (dx / d) * SABOTAGE_SPEED;
        b.vy = (dy / d) * SABOTAGE_SPEED;
      }
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 1;

      const { tx, ty } = worldToTile(b.x, b.y);
      if (isSolid(tileAt(tx, ty)) || b.life <= 0) {
        spawnBurst(b.x, b.y, "#c08040", 5);
        return false;
      }

      if (target && dist(b, target) < b.r + target.r) {
        target.slowTimer = Math.max(target.slowTimer, b.slow);
        spawnBurst(target.x, target.y, "#f0b429", 14);
        sfx("sabotageHit");
        return false;
      }
      return true;
    });
  }

  function updateBooks() {
    // UI refresh only when a cooldown is ticking (avoid touching DOM every frame)
    if (state.players.some((p) => p.bookCd > 0)) {
      updateBookUi();
    }

    state.books = state.books.filter((b) => {
      let target = b.target;
      if (
        target &&
        (target.stun > 0 ||
          (!state.zombies.includes(target) && target !== state.boss))
      ) {
        const owner = state.players.find((p) => p.id === b.ownerId) || state.players[0];
        target = owner ? nearestEnemyFor(owner) : null;
        b.target = target;
      }
      if (target) {
        const dx = target.x - b.x;
        const dy = target.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        b.vx = (dx / d) * BOOK_SPEED;
        b.vy = (dy / d) * BOOK_SPEED;
      }

      b.x += b.vx;
      b.y += b.vy;
      b.rot += 0.35;
      b.life -= 1;

      const { tx, ty } = worldToTile(b.x, b.y);
      if (isSolid(tileAt(tx, ty)) || b.life <= 0) {
        spawnBurst(b.x, b.y, "#8a6a30", 5);
        return false;
      }

      for (const z of state.zombies) {
        if (z.stun > 0) continue;
        if (dist(b, z) < b.r + z.r) {
          z.stun = STUN_TIME;
          spawnBurst(z.x, z.y, "#f0b429", 12);
          sfx("zombieHit");
          return false;
        }
      }

      if (
        state.boss &&
        state.boss.stun <= 0 &&
        dist(b, state.boss) < b.r + state.boss.r
      ) {
        state.boss.stun = STUN_TIME;
        state.boss.charging = false;
        state.boss.vx = 0;
        state.boss.vy = 0;
        state.boss.hpFlash = 25;
        spawnBurst(state.boss.x, state.boss.y, "#f0b429", 16);
        sfx("zombieHit");
        return false;
      }

      return true;
    });
  }

  function applyBossRoot(player) {
    if (!player || player.eliminated) return;
    if ((player.invuln | 0) > 0) return;
    if ((player.rootTimer | 0) > 0) return;
    player.rootTimer = BOSS_ROOT_TIME;
    player.invuln = 45;
    player.atExit = false;
    state.shake = Math.max(state.shake, 12);
    spawnBurst(player.x, player.y, "#7ec8ff", 14);
    sfx("bing");
  }

  function onCatch(player, reason) {
    state.shake = 12;
    spawnBurst(player.x, player.y, "#e85d4c", 16);
    // Projectile / hit lines already play bing; zombie grab keeps catch
    if (!/hit|shot|lightning|rain|potion|ball|note|struck/i.test(String(reason || ""))) {
      sfx("catch");
    }

    if (state.playMode === "solo") {
      fail(reason);
      return;
    }

    if (state.playMode === "coop") {
      if (player.invuln > 0) return;
      player.frozen = true;
      updateHud();
      const team = state.players.filter((p) => !p.eliminated);
      if (team.length > 0 && team.every((p) => p.frozen)) {
        fail(t("catch_both"));
      }
      return;
    }

    // versus
    if (player.invuln > 0) return;
    player.eliminated = true;
    player.frozen = true;
    updateHud();
    const survivors = alivePlayers();
    if (survivors.length === 1) {
      versusWin(survivors[0]);
    } else if (survivors.length === 0) {
      fail(t("catch_elim"));
    }
  }

  function updateZombies() {
    const targets = activeChaseTargets();
    for (const z of state.zombies) {
      if (z.stun > 0) {
        z.stun -= 1;
        continue;
      }
      if (z.wait > 0) {
        z.wait -= 1;
        continue;
      }
      const target = nearestPlayer(z, targets);
      if (!target) continue;

      const d = dist(z, target);
      const speed = d < 120 ? z.speed * 1.05 : z.speed;
      if (state.levelIndex >= 4) smartChase(z, target, speed);
      else chase(z, target, speed);

      for (const p of targets) {
        if (p.invuln > 0) continue;
        if (dist(z, p) < z.r + p.r - 2) {
          onCatch(p, t("catch_zombie"));
          if (state.mode !== "play") return;
        }
      }
    }
  }

  function fireBossShot(b, target, opts) {
    const dx = target.x - b.x;
    const dy = target.y - b.y;
    const d = Math.hypot(dx, dy) || 1;
    state.notes.push({
      x: b.x,
      y: b.y,
      vx: (dx / d) * (opts.speed || 3.4),
      vy: (dy / d) * (opts.speed || 3.4),
      r: opts.r || 10,
      life: opts.life || 160,
      emoji: opts.emoji || "♪",
      hitMsg: opts.hitMsg || t("hit_generic"),
      slow: opts.slow || 0,
    });
    sfx("sabotageThrow");
  }

  function updateBoss() {
    const b = state.boss;
    if (!b) return;

    if (b.stun > 0) {
      b.stun -= 1;
      b.charging = false;
      b.vx = 0;
      b.vy = 0;
      return;
    }

    const targets = activeChaseTargets();
    const target = nearestPlayer(b, targets);
    const bossType = b.bossType || "principal";

    if (bossType === "music") {
      if (target) smartChase(b, target, b.speed * 0.7);
      b.noteTimer = (b.noteTimer || 0) - 1;
      if (b.noteTimer <= 0 && target) {
        b.noteTimer = 55 + Math.random() * 35;
        fireBossShot(b, target, {
          emoji: ["♪", "♫", "♩", "♬"][(Math.random() * 4) | 0],
          speed: 3.4,
          hitMsg: t("hit_note"),
        });
      }
    } else if (bossType === "sports") {
      if (target) smartChase(b, target, b.speed * 0.95);
      b.noteTimer = (b.noteTimer || 0) - 1;
      if (b.noteTimer <= 0 && target) {
        b.noteTimer = 42 + Math.random() * 28;
        fireBossShot(b, target, {
          emoji: ["⚽", "🏀", "🏈"][(Math.random() * 3) | 0],
          speed: 4.6,
          r: 11,
          hitMsg: t("hit_ball"),
        });
      }
    } else if (bossType === "chem") {
      if (target) smartChase(b, target, b.speed * 0.75);
      b.noteTimer = (b.noteTimer || 0) - 1;
      if (b.noteTimer <= 0 && target) {
        b.noteTimer = 60 + Math.random() * 40;
        fireBossShot(b, target, {
          emoji: "🧪",
          speed: 2.8,
          r: 12,
          life: 180,
          hitMsg: t("hit_potion"),
          slow: 150,
        });
      }
    } else if (bossType === "cloud") {
      if (target) smartChase(b, target, b.speed * 0.8);
      b.noteTimer = (b.noteTimer || 0) - 1;
      if (b.noteTimer <= 0 && target) {
        b.noteTimer = 38 + Math.random() * 25;
        // Fan of 3 shots
        for (let i = -1; i <= 1; i++) {
          const ang = Math.atan2(target.y - b.y, target.x - b.x) + i * 0.28;
          state.notes.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(ang) * 3.8,
            vy: Math.sin(ang) * 3.8,
            r: 10,
            life: 150,
            emoji: i === 0 ? "⚡" : "💧",
            hitMsg: i === 0 ? t("hit_lightning") : t("hit_rain"),
          });
        }
        sfx("sabotageThrow");
        state.shake = 6;
      }
    } else {
      // Principal: charge attack
      b.chargeTimer -= 1;
      if (b.charging) {
        tryMove(b, b.vx, b.vy);
        b.vx *= 0.985;
        b.vy *= 0.985;
        if (Math.hypot(b.vx, b.vy) < 0.4) b.charging = false;
      } else if (b.chargeTimer <= 0 && target) {
        const dx = target.x - b.x;
        const dy = target.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        b.vx = (dx / d) * 5.2;
        b.vy = (dy / d) * 5.2;
        b.charging = true;
        b.chargeTimer = 90 + Math.random() * 50;
        b.hpFlash = 20;
        state.shake = 8;
      } else if (target) {
        smartChase(b, target, b.speed * 0.85);
      }
    }

    if (target) b.facing = target.x >= b.x ? 1 : -1;
    else if (Math.abs(b.vx) > 0.1) b.facing = b.vx > 0 ? 1 : -1;

    const catchMsg = {
      music: t("catch_music"),
      sports: t("catch_sports"),
      chem: t("catch_chem"),
      cloud: t("catch_cloud"),
      principal: t("catch_principal"),
    };

    // Melee contact still catches; projectiles only root (see updateNotes)
    for (const p of targets) {
      if ((p.invuln | 0) > 0 || (p.rootTimer | 0) > 0) continue;
      if (dist(b, p) < b.r + p.r - 4) {
        state.shake = 16;
        spawnBurst(p.x, p.y, "#e85d4c", 20);
        onCatch(p, catchMsg[bossType] || catchMsg.principal);
        if (state.mode !== "play") return;
      }
    }
  }

  function updateNotes() {
    if (!state.notes || !state.notes.length) return;
    const targets = activeChaseTargets();
    state.notes = state.notes.filter((n) => {
      n.x += n.vx;
      n.y += n.vy;
      n.life -= 1;
      const { tx, ty } = worldToTile(n.x, n.y);
      if (isSolid(tileAt(tx, ty)) || n.life <= 0) {
        spawnBurst(n.x, n.y, "#c9a227", 4);
        return false;
      }
      for (const p of targets) {
        if ((p.invuln | 0) > 0 || (p.rootTimer | 0) > 0) continue;
        if (dist(n, p) < n.r + p.r) {
          if (n.slow) p.slowTimer = Math.max(p.slowTimer || 0, n.slow);
          applyBossRoot(p);
          return false;
        }
      }
      return true;
    });
  }

  function updateParticles() {
    state.particles = state.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.vy += 0.04;
      return p.life > 0;
    });
  }

  function updateCamera(viewW, viewH) {
    const mapW = state.level.width * state.tileSize;
    const mapH = state.level.height * state.tileSize;

    // Midpoint of non-eliminated players (frozen still included)
    const cams = state.players.filter((p) => !p.eliminated);
    let focusX;
    let focusY;
    if (cams.length === 0) {
      focusX = state.players[0] ? state.players[0].x : 0;
      focusY = state.players[0] ? state.players[0].y : 0;
    } else {
      focusX = cams.reduce((s, p) => s + p.x, 0) / cams.length;
      focusY = cams.reduce((s, p) => s + p.y, 0) / cams.length;
    }

    let cx = focusX - viewW / 2;
    // Bias upward so the player isn't hidden behind the joysticks
    let cy = focusY - viewH / 2 + viewH * 0.06;
    cx = Math.max(0, Math.min(cx, mapW - viewW));
    cy = Math.max(0, Math.min(cy, mapH - viewH));
    if (mapW < viewW) cx = (mapW - viewW) / 2;
    if (mapH < viewH) cy = (mapH - viewH) / 2;

    if (state.shake > 0) {
      cx += (Math.random() - 0.5) * state.shake;
      cy += (Math.random() - 0.5) * state.shake;
      state.shake *= 0.85;
      if (state.shake < 0.4) state.shake = 0;
    }
    state.camera.x = cx;
    state.camera.y = cy;
  }

  function theme() {
    return (state.level && state.level.theme) || THEMES.foyer;
  }

  function isWalk(tx, ty) {
    const t = tileAt(tx, ty);
    return t !== TILE.WALL;
  }

  function drawFloor(ts) {
    const m = state.level.map;
    const th = theme();
    const id = state.level.themeId;
    const h = m.length;
    const w = m[0].length;
    const midX = (w / 2) | 0;
    const midY = (h / 2) | 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (m[y][x] === TILE.WALL) continue;
        const px = x * ts;
        const py = y * ts;
        const checker = (x + y) % 2 === 0;
        ctx.fillStyle = checker ? th.floorA : th.floorB;
        ctx.fillRect(px, py, ts, ts);

        if (id === "basketball") {
          ctx.strokeStyle = "rgba(240,232,216,0.45)";
          ctx.lineWidth = 2;
          if (y === midY) {
            ctx.beginPath();
            ctx.moveTo(px, py + ts / 2);
            ctx.lineTo(px + ts, py + ts / 2);
            ctx.stroke();
          }
          const dx = x - midX;
          const dy = y - midY;
          const d2 = dx * dx + dy * dy;
          if (d2 >= 4 && d2 <= 6) {
            ctx.strokeStyle = "rgba(240,232,216,0.55)";
            ctx.strokeRect(px + 4, py + 4, ts - 8, ts - 8);
          }
          if ((y === 4 || y === h - 5) && x >= midX - 2 && x <= midX + 2) {
            ctx.strokeStyle = "rgba(240,232,216,0.35)";
            ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
          }
          if ((y === 3 || y === h - 4) && x === midX) {
            ctx.strokeStyle = "#e85d4c";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px + ts / 2, py + ts / 2, 8, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (id === "gym") {
          ctx.strokeStyle = "rgba(240,220,180,0.18)";
          ctx.lineWidth = 1;
          if (y % 4 === 0) {
            ctx.beginPath();
            ctx.moveTo(px, py + 1);
            ctx.lineTo(px + ts, py + 1);
            ctx.stroke();
          }
        } else if (id === "track") {
          if (x % 2 === 0) {
            ctx.fillStyle = "rgba(240,240,232,0.12)";
            ctx.fillRect(px + ts / 2 - 1, py, 2, ts);
          }
          if (y % 5 === 0) {
            ctx.strokeStyle = "rgba(240,240,232,0.4)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px, py + ts / 2);
            ctx.lineTo(px + ts, py + ts / 2);
            ctx.stroke();
          }
        } else if (id === "pool") {
          ctx.fillStyle = "rgba(126,200,255,0.08)";
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
          if (x % 3 === 1) {
            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px + ts / 2, py);
            ctx.lineTo(px + ts / 2, py + ts);
            ctx.stroke();
            ctx.fillStyle = y % 2 === 0 ? "#e85d4c" : "#f0b429";
            ctx.fillRect(px + ts / 2 - 2, py + 4, 4, 4);
          }
        } else if (id === "yard") {
          if ((x * 7 + y * 3) % 5 === 0) {
            ctx.fillStyle = "rgba(143,191,90,0.35)";
            ctx.fillRect(px + 8, py + 10, 2, 6);
            ctx.fillRect(px + 12, py + 12, 2, 5);
            ctx.fillRect(px + 18, py + 11, 2, 6);
          }
        } else if (id === "computers" || id === "studio") {
          ctx.fillStyle = "rgba(78,196,240,0.06)";
          ctx.fillRect(px + 2, py + ts - 4, ts - 4, 2);
          if (id === "studio" && (x + y) % 6 === 0) {
            ctx.fillStyle = "rgba(232,120,208,0.15)";
            ctx.beginPath();
            ctx.arc(px + ts / 2, py + ts / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (id === "lobby" || id === "locker") {
          ctx.strokeStyle = "rgba(255,255,255,0.05)";
          ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
        } else if (id === "music" || id === "concert" || id === "piano") {
          if ((x + y) % 4 === 0) {
            ctx.fillStyle = "rgba(232,120,208,0.08)";
            ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
          }
        } else if (id === "bleachers") {
          if (y % 2 === 0) {
            ctx.fillStyle = "rgba(224,112,64,0.12)";
            ctx.fillRect(px, py + ts - 6, ts, 4);
          }
        } else if (id === "storage") {
          if ((x * 5 + y) % 7 === 0) {
            ctx.strokeStyle = "rgba(240,180,41,0.2)";
            ctx.strokeRect(px + 6, py + 8, ts - 12, ts - 14);
          }
        } else if (id === "reactor") {
          ctx.fillStyle = "rgba(224,112,64,0.06)";
          ctx.fillRect(px, py, ts, ts);
        } else if (id === "fog" || id === "cloud") {
          const wobble = Math.sin((state.time + x * 9 + y * 5) / 18) * 0.04 + 0.06;
          ctx.fillStyle = `rgba(200,220,240,${wobble})`;
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
        } else if (id === "storm") {
          if ((x * 11 + y * 3 + ((state.time / 20) | 0)) % 17 === 0) {
            ctx.strokeStyle = "rgba(240,216,120,0.35)";
            ctx.beginPath();
            ctx.moveTo(px + 8, py + 4);
            ctx.lineTo(px + 14, py + 14);
            ctx.lineTo(px + 10, py + 14);
            ctx.lineTo(px + 16, py + 26);
            ctx.stroke();
          }
        } else if (id === "cage") {
          ctx.strokeStyle = "rgba(192,200,208,0.12)";
          ctx.beginPath();
          ctx.moveTo(px + 8, py);
          ctx.lineTo(px + 8, py + ts);
          ctx.moveTo(px + ts - 8, py);
          ctx.lineTo(px + ts - 8, py + ts);
          ctx.stroke();
        } else if (id === "chemistry") {
          if ((x + y) % 5 === 0) {
            ctx.fillStyle = "rgba(80,224,160,0.07)";
            ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
          }
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
        }
      }
    }

    drawFloorProps(ts);
  }

  function drawFloorProps(ts) {
    const m = state.level.map;
    const id = state.level.themeId;
    const th = theme();

    for (let y = 1; y < m.length - 1; y++) {
      for (let x = 1; x < m[y].length - 1; x++) {
        if (m[y][x] === TILE.WALL || m[y][x] === TILE.EXIT || m[y][x] === TILE.KEY)
          continue;
        const nearWall =
          !isWalk(x - 1, y) ||
          !isWalk(x + 1, y) ||
          !isWalk(x, y - 1) ||
          !isWalk(x, y + 1);
        if (!nearWall && id !== "basketball" && id !== "pool" && id !== "track")
          continue;

        const hash = (x * 31 + y * 17 + indexSeed()) % 7;
        if (hash > 2 && id !== "basketball") continue;

        const px = x * ts;
        const py = y * ts;

        if (id === "basketball" && !nearWall && (x + y) % 11 === 0) {
          ctx.fillStyle = "#e07040";
          ctx.beginPath();
          ctx.arc(px + ts / 2, py + ts / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath();
          ctx.arc(px + ts / 2, py + ts / 2, 5, 0.2, 2.5);
          ctx.stroke();
        } else if ((id === "computers" || id === "studio") && hash === 0 && nearWall) {
          ctx.fillStyle = "#1a2838";
          ctx.fillRect(px + 6, py + 14, ts - 12, 8);
          ctx.fillStyle = th.accent;
          ctx.fillRect(px + 10, py + 6, ts - 20, 10);
          ctx.fillStyle = "#0a1520";
          ctx.fillRect(px + 12, py + 8, ts - 24, 6);
        } else if (id === "teachers" && hash === 1 && nearWall) {
          ctx.fillStyle = "#5a4030";
          ctx.fillRect(px + 8, py + 10, ts - 16, 12);
          ctx.fillStyle = "#c08050";
          ctx.beginPath();
          ctx.arc(px + ts / 2, py + 14, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (id === "classroom" && hash === 0 && nearWall) {
          ctx.fillStyle = "#6a5a40";
          ctx.fillRect(px + 5, py + 12, ts - 10, 8);
          ctx.fillStyle = "#8a7a58";
          ctx.fillRect(px + 8, py + 8, ts - 16, 5);
        } else if ((id === "chemistry" || id === "reactor") && hash === 1 && nearWall) {
          ctx.fillStyle =
            id === "reactor" ? "rgba(224,112,64,0.45)" : "rgba(80,224,160,0.35)";
          ctx.beginPath();
          ctx.moveTo(px + 12, py + 8);
          ctx.lineTo(px + 20, py + 8);
          ctx.lineTo(px + 18, py + 20);
          ctx.lineTo(px + 14, py + 20);
          ctx.closePath();
          ctx.fill();
        } else if (id === "office" && hash === 0 && nearWall) {
          ctx.fillStyle = "rgba(240,180,41,0.12)";
          ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
        } else if (id === "foyer" && hash === 2 && nearWall) {
          ctx.fillStyle = "rgba(196,163,90,0.2)";
          ctx.fillRect(px + 4, py + ts - 10, ts - 8, 4);
        } else if ((id === "storage" || id === "gym") && hash === 0 && nearWall) {
          ctx.fillStyle = "#5a4030";
          ctx.fillRect(px + 6, py + 10, ts - 12, 12);
          ctx.fillStyle = th.accent;
          ctx.fillRect(px + 8, py + 12, ts - 16, 3);
          ctx.beginPath();
          ctx.arc(px + 12, py + 18, 3, 0, Math.PI * 2);
          ctx.arc(px + ts - 12, py + 18, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (id === "pool" && nearWall && hash === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fillRect(px + 4, py + ts - 8, ts - 8, 4);
        } else if (id === "track" && nearWall && hash === 1) {
          ctx.fillStyle = "#f0f0e8";
          ctx.fillRect(px + 10, py + 8, 4, 14);
        } else if (
          (id === "music" || id === "piano" || id === "concert") &&
          nearWall &&
          hash <= 1
        ) {
          ctx.fillStyle = "#1a1020";
          ctx.fillRect(px + 6, py + 14, ts - 12, 8);
          ctx.fillStyle = th.accent;
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(px + 8 + i * 5, py + 8, 3, 8);
          }
        } else if (id === "bleachers" && nearWall && hash === 0) {
          ctx.fillStyle = "#6a5040";
          ctx.fillRect(px + 2, py + 8, ts - 4, 4);
          ctx.fillRect(px + 4, py + 14, ts - 8, 4);
        } else if (id === "locker" && nearWall && hash <= 1) {
          ctx.fillStyle = "#5a6878";
          ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.strokeRect(px + 4, py + 4, ts - 8, ts - 8);
          ctx.fillStyle = "#c0d0d8";
          ctx.fillRect(px + ts - 12, py + ts / 2 - 1, 3, 3);
        } else if (id === "cage" && nearWall && hash === 0) {
          ctx.strokeStyle = "rgba(192,200,208,0.5)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(px + 8 + i * 6, py + 4);
            ctx.lineTo(px + 8 + i * 6, py + ts - 4);
            ctx.stroke();
          }
        } else if (id === "library" && hash === 0 && nearWall) {
          ctx.fillStyle = "#4a2818";
          ctx.fillRect(px + 6, py + 8, ts - 12, 14);
          const colors = ["#a33", "#3a5", "#36a", "#a83"];
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(px + 8 + i * 5, py + 10, 4, 10);
          }
        }
      }
    }
  }

  function indexSeed() {
    return state.levelIndex * 13;
  }

  function drawWalls(ts) {
    const m = state.level.map;
    const th = theme();
    const id = state.level.themeId;

    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        const t = m[y][x];
        const px = x * ts;
        const py = y * ts;

        if (t === TILE.WALL) {
          ctx.fillStyle = th.wall;
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = th.wallTop;
          ctx.fillRect(px, py, ts, 6);
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(px, py + ts - 5, ts, 5);
          drawWallFace(x, y, px, py, ts, id, th);
        } else if (t === TILE.KEY) {
          ctx.fillStyle = "rgba(240,180,41,0.18)";
          ctx.beginPath();
          ctx.arc(
            px + ts / 2,
            py + ts / 2,
            12 + Math.sin(state.time / 8) * 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.font = "18px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🔑", px + ts / 2, py + ts / 2);
        } else if (t === TILE.EXIT) {
          const open = state.keys >= state.keysNeeded;
          ctx.fillStyle = open ? "#1f6b45" : "#5a3a20";
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
          ctx.fillStyle = open ? "#3ecf8e" : "#c47a2a";
          ctx.fillRect(px + 6, py + 6, ts - 12, ts - 12);
          ctx.font = "16px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(open ? "🚪" : "🔒", px + ts / 2, py + ts / 2);
          if (open) {
            ctx.fillStyle = "rgba(62,207,142,0.2)";
            ctx.beginPath();
            ctx.arc(
              px + ts / 2,
              py + ts / 2,
              14 + Math.sin(state.time / 6) * 3,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
    }
  }

  function drawWallFace(x, y, px, py, ts, id, th) {
    const facesFloor =
      isWalk(x - 1, y) || isWalk(x + 1, y) || isWalk(x, y - 1) || isWalk(x, y + 1);
    if (!facesFloor) return;

    const variant = (x + y * 3) % 3;

    if (id === "corridor" || id === "lobby") {
      ctx.fillStyle = variant === 0 ? "#2a6a8a" : variant === 1 ? "#2a5a70" : "#245868";
      ctx.fillRect(px + 3, py + 5, ts - 6, ts - 10);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.strokeRect(px + 3, py + 5, ts - 6, ts - 10);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 7, py + 10 + i * 5);
        ctx.lineTo(px + ts - 7, py + 10 + i * 5);
        ctx.stroke();
      }
      ctx.fillStyle = "#c0d0d8";
      ctx.fillRect(px + ts - 10, py + ts / 2 - 1, 4, 3);
    } else if (id === "library") {
      ctx.fillStyle = "#4a2818";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      const colors = ["#a33", "#3a5", "#36a", "#a83", "#729"];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[(x + i) % colors.length];
        ctx.fillRect(px + 4 + i * 6, py + 6, 5, ts - 14);
      }
    } else if (id === "classroom" || id === "foyer") {
      ctx.fillStyle = id === "classroom" ? "#1a3a2a" : "#5a4a30";
      ctx.fillRect(px + 4, py + 6, ts - 8, ts - 14);
      ctx.strokeStyle = th.accent;
      ctx.strokeRect(px + 4, py + 6, ts - 8, ts - 14);
      if (id === "foyer" && variant === 0) {
        ctx.fillStyle = "rgba(240,180,41,0.5)";
        ctx.fillRect(px + 8, py + 10, 6, 8);
        ctx.fillStyle = "rgba(80,180,220,0.5)";
        ctx.fillRect(px + 16, py + 12, 6, 6);
      }
    } else if (id === "computers") {
      ctx.fillStyle = "#152030";
      ctx.fillRect(px + 4, py + 5, ts - 8, ts - 10);
      ctx.fillStyle = th.accent;
      ctx.fillRect(px + 8, py + 10, 4, 4);
      ctx.fillStyle = "#3ecf8e";
      ctx.fillRect(px + 14, py + 10, 4, 4);
      ctx.fillStyle = "#e85d4c";
      ctx.fillRect(px + 20, py + 10, 4, 4);
    } else if (id === "teachers") {
      ctx.fillStyle = "#6a4838";
      ctx.fillRect(px + 3, py + 5, ts - 6, ts - 10);
      ctx.fillStyle = th.accent;
      ctx.beginPath();
      ctx.arc(px + ts / 2, py + 14, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "chemistry") {
      ctx.fillStyle = "#1a4040";
      ctx.fillRect(px + 3, py + 5, ts - 6, ts - 10);
      ctx.fillStyle = th.accent;
      ctx.fillRect(px + 8, py + 12, ts - 16, 6);
      ctx.strokeStyle = "rgba(255,80,80,0.5)";
      ctx.strokeRect(px + 6, py + 8, ts - 12, 4);
    } else if (id === "gym") {
      ctx.fillStyle = "#8a5030";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = th.accent;
      ctx.fillRect(px + 6, py + 10, ts - 12, 6);
    } else if (id === "yard") {
      ctx.fillStyle = "#6a5a48";
      ctx.fillRect(px + 2, py + 8, ts - 4, 4);
      ctx.fillRect(px + 2, py + 16, ts - 4, 4);
    } else if (id === "office") {
      ctx.fillStyle = "#3a2040";
      ctx.fillRect(px + 3, py + 5, ts - 6, ts - 10);
      ctx.strokeStyle = th.accent;
      ctx.strokeRect(px + 5, py + 7, ts - 10, ts - 14);
      if (variant === 0) {
        ctx.fillStyle = th.accent;
        ctx.beginPath();
        ctx.arc(px + ts / 2, py + ts / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === "basketball") {
      ctx.fillStyle = "#8a4830";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.strokeStyle = "rgba(240,232,216,0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 6, py + 8, ts - 12, ts - 16);
      ctx.strokeStyle = "#e85d4c";
      ctx.beginPath();
      ctx.arc(px + ts / 2, py + 12, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#e85d4c";
      ctx.fillRect(px + ts / 2 - 1, py + 4, 2, 6);
    } else if (id === "pool") {
      ctx.fillStyle = "#2a6a88";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(px + 4, py + ts - 10, ts - 8, 4);
      ctx.fillStyle = variant === 0 ? "#e85d4c" : "#f0b429";
      ctx.fillRect(px + 8, py + 8, 4, 8);
      ctx.fillRect(px + ts - 12, py + 8, 4, 8);
    } else if (id === "track") {
      ctx.fillStyle = "#7a3028";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.strokeStyle = "rgba(240,240,232,0.55)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 6 + i * 7, py + 6);
        ctx.lineTo(px + 6 + i * 7, py + ts - 6);
        ctx.stroke();
      }
    } else if (id === "locker") {
      ctx.fillStyle = "#4a5868";
      ctx.fillRect(px + 2, py + 3, ts - 4, ts - 6);
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.moveTo(px + ts / 2, py + 3);
      ctx.lineTo(px + ts / 2, py + ts - 3);
      ctx.stroke();
      ctx.fillStyle = "#c0d0d8";
      ctx.fillRect(px + ts / 2 - 6, py + ts / 2 - 1, 3, 3);
      ctx.fillRect(px + ts / 2 + 3, py + ts / 2 - 1, 3, 3);
    } else if (id === "bleachers") {
      ctx.fillStyle = "#6a4030";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = th.accent;
      ctx.fillRect(px + 4, py + 8, ts - 8, 3);
      ctx.fillRect(px + 6, py + 14, ts - 12, 3);
      ctx.fillRect(px + 8, py + 20, ts - 16, 3);
    } else if (id === "storage") {
      ctx.fillStyle = "#5a4830";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = "#3a3020";
      ctx.fillRect(px + 6, py + 8, ts - 12, ts - 16);
      ctx.strokeStyle = th.accent;
      ctx.strokeRect(px + 6, py + 8, ts - 12, ts - 16);
      ctx.fillStyle = th.accent;
      ctx.fillRect(px + ts / 2 - 2, py + ts / 2, 4, 3);
    } else if (id === "music" || id === "concert" || id === "piano") {
      ctx.fillStyle = id === "concert" ? "#3a1848" : "#2a1838";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = th.accent;
      ctx.beginPath();
      ctx.ellipse(px + ts / 2, py + 12, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px + ts / 2 + 3, py + 6, 2, 10);
      if (id === "piano") {
        ctx.fillStyle = "#f0f0e8";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(px + 6 + i * 5, py + ts - 12, 4, 6);
        }
        ctx.fillStyle = "#1a1020";
        ctx.fillRect(px + 9, py + ts - 12, 2, 4);
        ctx.fillRect(px + 19, py + ts - 12, 2, 4);
      }
    } else if (id === "studio") {
      ctx.fillStyle = "#1a2030";
      ctx.fillRect(px + 3, py + 5, ts - 6, ts - 10);
      ctx.fillStyle = th.accent;
      ctx.fillRect(px + 8, py + 10, ts - 16, 8);
      ctx.fillStyle = "#0a1520";
      ctx.fillRect(px + 10, py + 12, ts - 20, 4);
      ctx.fillStyle = "#e878d0";
      ctx.beginPath();
      ctx.arc(px + 10, py + 22, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "reactor") {
      ctx.fillStyle = "#4a2818";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = th.accent;
      ctx.beginPath();
      ctx.arc(px + ts / 2, py + ts / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,200,80,0.5)";
      ctx.beginPath();
      ctx.arc(px + ts / 2, py + ts / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "fog" || id === "cloud") {
      ctx.fillStyle = id === "cloud" ? "#5a7088" : "#4a6078";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.fillStyle = "rgba(220,230,240,0.45)";
      ctx.beginPath();
      ctx.arc(px + 10, py + 14, 5, 0, Math.PI * 2);
      ctx.arc(px + 16, py + 12, 6, 0, Math.PI * 2);
      ctx.arc(px + 22, py + 15, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "storm") {
      ctx.fillStyle = "#2a3850";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.strokeStyle = th.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 12, py + 6);
      ctx.lineTo(px + 18, py + 14);
      ctx.lineTo(px + 14, py + 14);
      ctx.lineTo(px + 20, py + 24);
      ctx.stroke();
    } else if (id === "cage") {
      ctx.fillStyle = "#3a4048";
      ctx.fillRect(px + 2, py + 4, ts - 4, ts - 8);
      ctx.strokeStyle = "rgba(192,200,208,0.7)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 6 + i * 6, py + 5);
        ctx.lineTo(px + 6 + i * 6, py + ts - 5);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 10);
      ctx.lineTo(px + ts - 4, py + 10);
      ctx.moveTo(px + 4, py + ts - 12);
      ctx.lineTo(px + ts - 4, py + ts - 12);
      ctx.stroke();
    }
  }

  function drawCharacter(ent, palette, scale = 1) {
    drawCharacterToCtx(ctx, ent, palette, scale);
  }

  function drawBoss(b) {
    const flash = b.hpFlash > 0;
    if (b.hpFlash > 0) b.hpFlash -= 1;
    const t = b.bossType || "principal";
    const palettes = {
      principal: {
        body: flash ? "#6b1f1f" : "#3a1f4a",
        skin: flash ? "#9ae87a" : "#6fbf4a",
        eye: "#ff3b3b",
        pupil: "#1a0505",
        accent: "#f0b429",
      },
      music: {
        body: flash ? "#6b1f1f" : "#4a2060",
        skin: flash ? "#9ae87a" : "#6fbf4a",
        eye: "#ffd24a",
        pupil: "#1a0505",
        accent: "#e878d0",
      },
      sports: {
        body: flash ? "#6b1f1f" : "#1f4a6b",
        skin: flash ? "#9ae87a" : "#6fbf4a",
        eye: "#7ec8ff",
        pupil: "#1a0505",
        accent: "#f0b429",
      },
      chem: {
        body: flash ? "#6b1f1f" : "#1f6b3a",
        skin: flash ? "#9ae87a" : "#6fbf4a",
        eye: "#a0ff70",
        pupil: "#1a0505",
        accent: "#7ecf3e",
      },
      cloud: {
        body: flash ? "#6b1f1f" : "#2a3550",
        skin: flash ? "#9ae87a" : "#9ab0d0",
        eye: "#ffffff",
        pupil: "#203050",
        accent: "#7ec8ff",
      },
    };
    const hats = {
      principal: null,
      music: "🎵",
      sports: "🏅",
      chem: "⚗️",
      cloud: "☁️",
    };
    drawCharacter(b, palettes[t] || palettes.principal, 2.1);

    ctx.save();
    ctx.translate(b.x, b.y - 38);
    if (hats[t]) {
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.fillText(hats[t], 0, 4);
    } else {
      ctx.fillStyle = "#f0b429";
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-6, -10);
      ctx.lineTo(0, -2);
      ctx.lineTo(6, -10);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    if (b.charging) {
      ctx.strokeStyle = "rgba(232,93,76,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 34 + Math.sin(state.time / 3) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawStunStars(x, y) {
    ctx.save();
    ctx.font = "12px serif";
    ctx.textAlign = "center";
    const wobble = Math.sin(state.time / 6) * 3;
    ctx.fillText("💫", x - 8, y + wobble);
    ctx.fillText("⭐", x + 8, y - wobble);
    ctx.restore();
  }

  function drawPlayer(p) {
    if (p.eliminated) {
      ctx.globalAlpha = 0.35;
    }
    const blink = p.invuln > 0 && !p.frozen && Math.floor(p.invuln / 4) % 2 === 0;
    if (!blink || p.eliminated) {
      const pal =
        p.frozen || p.eliminated
          ? FROZEN_PALETTE
          : {
              ...p.palette,
              hair: p.hair || p.palette.hair,
              hairColor: p.hairColor || p.palette.hairColor,
            };
      drawCharacter(p, pal);
      if (p.frozen && !p.eliminated) {
        ctx.font = "16px serif";
        ctx.textAlign = "center";
        ctx.fillText("❄️", p.x, p.y - 28);
      }
      if (p.rootTimer > 0 && !p.frozen && !p.eliminated) {
        ctx.save();
        ctx.strokeStyle = "rgba(126,200,255,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 6 + Math.sin(state.time / 8), 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "14px serif";
        ctx.textAlign = "center";
        ctx.fillText("🔒", p.x, p.y - 28);
        ctx.restore();
      }
      if (p.heldSabotage) {
        ctx.font = "14px serif";
        ctx.textAlign = "center";
        ctx.fillText(p.heldSabotage.emoji, p.x + 12, p.y - 18);
      }
      if (p.slowTimer > 0 && !p.frozen) {
        ctx.font = "12px serif";
        ctx.textAlign = "center";
        ctx.fillText("🐌", p.x, p.y + 22);
      }
    }
    if (isDual()) {
      ctx.globalAlpha = p.eliminated ? 0.5 : 1;
      ctx.fillStyle = p.id === 0 ? "#7ec8ff" : "#ffb0a0";
      ctx.font = "700 11px Heebo, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(playerName(p.id), p.x, p.y - 26);
    }
    ctx.globalAlpha = 1;
  }

  function drawOverlay(viewW, viewH) {
    const g = ctx.createRadialGradient(
      viewW / 2,
      viewH / 2,
      viewH * 0.2,
      viewW / 2,
      viewH / 2,
      viewH * 0.75
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);

    if (state.keys >= state.keysNeeded && state.mode === "play") {
      ctx.fillStyle = "rgba(62,207,142,0.9)";
      ctx.font = "700 14px Heebo, sans-serif";
      ctx.textAlign = "center";
      const msg =
        state.playMode === "coop"
          ? t("tip_both")
          : state.playMode === "versus"
            ? t("tip_race")
            : t("tip_door");
      ctx.fillText(msg, viewW / 2, viewH - 96);
    } else if (state.mode === "play") {
      ctx.fillStyle = "rgba(240,180,41,0.85)";
      ctx.font = "700 14px Heebo, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t("tip_find_key"), viewW / 2, 24);
      if (
        hasBooks() &&
        (state.worldIndex || 0) === 0 &&
        state.levelIndex === BOOK_UNLOCK_LEVEL &&
        state.time < 180
      ) {
        ctx.fillStyle = "rgba(126,200,255,0.95)";
        ctx.fillText(t("tip_throw_book"), viewW / 2, 44);
      }
      if (state.playMode === "versus" && state.time < 200) {
        ctx.fillStyle = "rgba(255,180,120,0.95)";
        ctx.fillText(t("tip_sabotage"), viewW / 2, 64);
      }
    }
  }

  function render() {
    const { viewW, viewH, scale } = viewSize();
    const dpr = state.dpr || 1;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, viewW, viewH);

    if (!state.level) {
      ctx.fillStyle = "#0d1b14";
      ctx.fillRect(0, 0, viewW, viewH);
      return;
    }

    updateCamera(viewW, viewH);
    const ts = state.tileSize;

    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

    drawFloor(ts);
    drawWalls(ts);

    for (const item of state.sabotageItems) {
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const bob = Math.sin(state.time / 10 + item.x) * 2;
      ctx.fillText(item.emoji, item.x, item.y + bob);
    }

    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const z of state.zombies) {
      drawCharacter(z, {
        body: z.stun > 0 ? "#5a6a40" : "#3d4f2a",
        skin: z.stun > 0 ? "#a8d878" : "#7cbc4a",
        eye: z.stun > 0 ? "#fff4a0" : "#c0ff70",
        pupil: "#1a2a10",
        accent: "#5a3a2a",
      });
      if (z.stun > 0) drawStunStars(z.x, z.y - 22);
    }

    if (state.boss) {
      drawBoss(state.boss);
      if (state.boss.stun > 0) drawStunStars(state.boss.x, state.boss.y - 48);
    }

    for (const b of state.books) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = "#8b4518";
      ctx.fillRect(-7, -5, 14, 10);
      ctx.fillStyle = "#f0e6d0";
      ctx.fillRect(-5, -3, 10, 6);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-5, -3, 2, 6);
      ctx.restore();
    }

    for (const b of state.sabotageProjs) {
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.emoji, b.x, b.y);
    }

    for (const n of state.notes || []) {
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.emoji || "♪", n.x, n.y);
    }

    for (const p of state.players) {
      drawPlayer(p);
    }

    ctx.restore();
    drawOverlay(viewW, viewH);
  }

  function tick() {
    state.animId = requestAnimationFrame(tick);
    state.time += 1;

    if (state.mode === "play") {
      if (isOnlineGuest()) {
        netSendLocalInput();
        updateParticles();
      } else {
        if (isOnlineHost()) {
          applyRemoteGuestInput();
        }
        updatePlayers();
        if (state.mode !== "play") {
          if (isOnlineHost()) netBroadcastState(true);
          render();
          return;
        }
        updateBooks();
        updateSabotageProjs();
        updateNotes();
        updateZombies();
        if (state.mode !== "play") {
          if (isOnlineHost()) netBroadcastState(true);
          render();
          return;
        }
        updateBoss();
        updateParticles();
        if (isOnlineHost()) {
          state.netSendAcc += 1;
          if (state.netSendAcc >= 2) {
            state.netSendAcc = 0;
            netBroadcastState(false);
          }
        }
      }
    } else if (state.level) {
      updateParticles();
    }

    render();
  }

  // --- Dual joysticks (pointer + touch, mobile-safe) ---
  function bindJoystick(baseEl, knobEl, playerIndex) {
    if (!baseEl || !knobEl) return;

    let active = false;
    let pointerId = null;

    function stickMax() {
      return Math.max(22, Math.min(40, (baseEl.clientWidth || 80) * 0.38));
    }

    function applyInput(dx, dy) {
      const max = stickMax();
      const d = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(d, max);
      const nx = (dx / d) * clamped;
      const ny = (dy / d) * clamped;
      knobEl.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
      const idx = state.online ? localPlayerId() : playerIndex;
      const p = state.players[idx];
      if (p) {
        p.input.x = nx / max;
        p.input.y = ny / max;
      }
    }

    function resetInput() {
      knobEl.style.transform = "translate(-50%, -50%)";
      const idx = state.online ? localPlayerId() : playerIndex;
      const p = state.players[idx];
      if (p) {
        p.input.x = 0;
        p.input.y = 0;
      }
      active = false;
      pointerId = null;
    }

    function offsetFromEvent(clientX, clientY) {
      const rect = baseEl.getBoundingClientRect();
      return {
        dx: clientX - (rect.left + rect.width / 2),
        dy: clientY - (rect.top + rect.height / 2),
      };
    }

    function startAt(clientX, clientY, id) {
      if (state.mode !== "play") return;
      active = true;
      pointerId = id;
      const { dx, dy } = offsetFromEvent(clientX, clientY);
      applyInput(dx, dy);
    }

    function moveAt(clientX, clientY, id) {
      if (!active) return;
      if (pointerId !== null && id !== pointerId) return;
      const { dx, dy } = offsetFromEvent(clientX, clientY);
      applyInput(dx, dy);
    }

    function endAt(id) {
      if (!active) return;
      if (pointerId !== null && id !== pointerId) return;
      resetInput();
    }

    // Pointer events
    baseEl.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        baseEl.setPointerCapture(e.pointerId);
      } catch (_) {}
      startAt(e.clientX, e.clientY, e.pointerId);
    });
    baseEl.addEventListener("pointermove", (e) => {
      if (!active) return;
      e.preventDefault();
      moveAt(e.clientX, e.clientY, e.pointerId);
    });
    baseEl.addEventListener("pointerup", (e) => endAt(e.pointerId));
    baseEl.addEventListener("pointercancel", (e) => endAt(e.pointerId));

    // Touch fallback (iOS / older WebViews)
    baseEl.addEventListener(
      "touchstart",
      (e) => {
        if (state.mode !== "play") return;
        e.preventDefault();
        e.stopPropagation();
        const t = e.changedTouches[0];
        if (!t) return;
        startAt(t.clientX, t.clientY, t.identifier);
      },
      { passive: false }
    );
    baseEl.addEventListener(
      "touchmove",
      (e) => {
        if (!active) return;
        e.preventDefault();
        e.stopPropagation();
        const t = [...e.changedTouches].find((x) => x.identifier === pointerId) || e.touches[0];
        if (!t) return;
        moveAt(t.clientX, t.clientY, t.identifier);
      },
      { passive: false }
    );
    baseEl.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        endAt(t ? t.identifier : pointerId);
      },
      { passive: false }
    );
    baseEl.addEventListener(
      "touchcancel",
      (e) => {
        const t = e.changedTouches[0];
        endAt(t ? t.identifier : pointerId);
      },
      { passive: false }
    );
  }

  bindJoystick(joy1, knob1, 0);
  bindJoystick(joy2, knob2, 1);

  window.addEventListener("keydown", (e) => {
    pressed.add(e.code);
    pressed.add(e.key);
    if (e.key) pressed.add(e.key.toLowerCase());

    // keep legacy map in sync (used nowhere critical, but safe)
    state.keysHeld[e.key] = true;
    state.keysHeld[e.code] = true;

    if (state.mode === "play") {
      if (
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD" ||
        e.code === "Quote"
      ) {
        e.preventDefault();
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (isOnlineGuest()) {
          queueGuestThrow();
        } else {
          const pid = state.online ? localPlayerId() : 0;
          if (state.players[pid]) throwBook(state.players[pid]);
        }
      }
      if (
        !state.online &&
        (e.code === "Enter" || e.code === "KeyE" || e.key === "Enter")
      ) {
        e.preventDefault();
        if (state.players[1]) throwBook(state.players[1]);
      }
      if (e.code.startsWith("Arrow")) e.preventDefault();
    }
    if (e.key === "Escape" && state.mode === "play") {
      state.mode = "pause";
      showScreen("pause");
      hideControls();
    }
  });
  window.addEventListener("keyup", (e) => {
    pressed.delete(e.code);
    pressed.delete(e.key);
    if (e.key) pressed.delete(e.key.toLowerCase());
    state.keysHeld[e.key] = false;
    state.keysHeld[e.code] = false;
  });
  window.addEventListener("blur", () => {
    pressed.clear();
  });

  // --- Online lobby + host-authoritative sync ---
  let guestThrowFlag = false;

  function queueGuestThrow() {
    guestThrowFlag = true;
    netSendLocalInput(true);
  }

  function applyRemoteGuestInput() {
    const p = state.players[1];
    if (!p) return;
    p.input.x = state.remoteInput.x || 0;
    p.input.y = state.remoteInput.y || 0;
    if (state.remoteInput.throwQueued) {
      state.remoteInput.throwQueued = false;
      throwBook(p);
    }
  }

  function netSend(msg) {
    if (window.OnlineNet) OnlineNet.send(msg);
  }

  function netSendEvent(payload) {
    netSend({ type: "event", ...payload });
  }

  function netSendLocalInput(forceThrow) {
    if (!isOnlineGuest() || !window.OnlineNet) return;
    const p = state.players[localPlayerId()];
    let x = 0;
    let y = 0;
    if (p) {
      x = p.input.x;
      y = p.input.y;
    }
    // Also fold WASD for guest
    if (keyActive("KeyA", "a", "A", "ש")) x -= 1;
    if (keyActive("KeyD", "d", "D", "ג")) x += 1;
    if (keyActive("KeyW", "w", "W", "Quote", "'", "׳")) y -= 1;
    if (keyActive("KeyS", "s", "S", "ד")) y += 1;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    const doThrow = forceThrow || guestThrowFlag;
    guestThrowFlag = false;
    OnlineNet.sendInput({ x, y, throw: doThrow });
  }

  function serializePlayer(p) {
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      facing: p.facing,
      bob: p.bob,
      invuln: p.invuln,
      frozen: p.frozen,
      eliminated: p.eliminated,
      atExit: p.atExit,
      bookCd: p.bookCd,
      lastAimX: p.lastAimX,
      lastAimY: p.lastAimY,
      slowTimer: p.slowTimer,
      rootTimer: p.rootTimer || 0,
      heldSabotage: p.heldSabotage,
    };
  }

  function netBroadcastState(force) {
    if (!isOnlineHost() || !window.OnlineNet) return;
    const mapKeys = [];
    if (state.level && state.level.map) {
      const m = state.level.map;
      for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
          if (m[y][x] === TILE.KEY) mapKeys.push([x, y]);
        }
      }
    }
    OnlineNet.sendState({
      force: !!force,
      mode: state.mode,
      playMode: state.playMode,
      levelIndex: state.levelIndex,
      keys: state.keys,
      keysNeeded: state.keysNeeded,
      versusScore: state.versusScore.slice(),
      versusFinal: state.versusFinal,
      names: state.names.slice(),
      mapKeys,
      players: state.players.map(serializePlayer),
      zombies: state.zombies.map((z) => ({
        x: z.x,
        y: z.y,
        r: z.r,
        stun: z.stun,
        wait: z.wait,
        facing: z.facing,
        kind: z.kind,
      })),
      boss: state.boss
        ? {
            x: state.boss.x,
            y: state.boss.y,
            r: state.boss.r,
            stun: state.boss.stun,
            facing: state.boss.facing,
            charging: state.boss.charging,
            vx: state.boss.vx,
            vy: state.boss.vy,
            hpFlash: state.boss.hpFlash,
          }
        : null,
      books: state.books.map((b) => ({
        x: b.x,
        y: b.y,
        vx: b.vx,
        vy: b.vy,
        r: b.r,
        life: b.life,
        rot: b.rot,
        ownerId: b.ownerId,
      })),
      sabotageItems: state.sabotageItems.map((s) => ({
        x: s.x,
        y: s.y,
        emoji: s.emoji,
        slow: s.slow,
      })),
      sabotageProjs: state.sabotageProjs.map((b) => ({
        x: b.x,
        y: b.y,
        vx: b.vx,
        vy: b.vy,
        r: b.r,
        life: b.life,
        slow: b.slow,
        emoji: b.emoji,
        ownerId: b.ownerId,
      })),
    });
  }

  function applyOnlineState(msg) {
    if (!isOnlineGuest()) return;
    if (msg.names) state.names = msg.names;
    if (msg.versusScore) state.versusScore = msg.versusScore;
    state.versusFinal = !!msg.versusFinal;
    state.keys = msg.keys | 0;
    state.keysNeeded = msg.keysNeeded | 0;

    if (
      typeof msg.levelIndex === "number" &&
      (!state.level || msg.levelIndex !== state.levelIndex || state.playMode !== msg.playMode)
    ) {
      state.playMode = msg.playMode || state.playMode;
      loadLevel(msg.levelIndex);
    }
    state.levelIndex = msg.levelIndex | 0;
    if (msg.playMode) state.playMode = msg.playMode;

    // Sync remaining keys on map
    if (state.level && Array.isArray(msg.mapKeys)) {
      const keep = new Set(msg.mapKeys.map(([x, y]) => `${x},${y}`));
      const m = state.level.map;
      for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
          if (m[y][x] === TILE.KEY && !keep.has(`${x},${y}`)) {
            m[y][x] = TILE.EMPTY;
          }
        }
      }
    }

    if (Array.isArray(msg.players) && state.players.length) {
      msg.players.forEach((sp, i) => {
        const p = state.players[i];
        if (!p || !sp) return;
        Object.assign(p, sp);
        if (!p.input) p.input = { x: 0, y: 0 };
        if (i === localPlayerId()) {
          applyAvatarToPlayer(p, loadAvatar());
        } else {
          p.palette = paletteForPlayerId(i);
          p.hair = p.palette.hair;
          p.hairColor = p.palette.hairColor;
        }
      });
    }

    if (Array.isArray(msg.zombies)) {
      state.zombies = msg.zombies.map((z) => ({
        ...z,
        speed: z.speed || 1.1,
      }));
    }
    state.boss = msg.boss || null;
    state.books = Array.isArray(msg.books) ? msg.books : [];
    state.sabotageItems = Array.isArray(msg.sabotageItems) ? msg.sabotageItems : [];
    state.sabotageProjs = Array.isArray(msg.sabotageProjs) ? msg.sabotageProjs : [];

    if (msg.mode === "play" && state.mode !== "play") {
      beginPlayGuestMirror();
    } else if (msg.mode && msg.mode !== "play") {
      // screen modes handled by events primarily
    }

    updateHud();
    updateBookUi();
    syncNameLabels();
  }

  function beginPlayGuestMirror() {
    state.mode = "play";
    hideAllScreens();
    setPlayChrome(true);
    controls.hidden = false;
    syncControlPads();
    updateHud();
    updateBookUi();
    requestAnimationFrame(() => resize());
    sfx(isBossLevel() ? "startBossPlay" : "startPlay", state.worldIndex || 0);
  }

  function clearOnlineSession() {
    state.online = false;
    state.onlineRole = null;
    state.myPlayerId = 0;
    state.remoteInput = { x: 0, y: 0, throwQueued: false };
    if (window.OnlineNet) {
      OnlineNet.leaveRoom();
      OnlineNet.setLobbyStatus(false);
    }
  }

  function returnToMenu(leaveNet) {
    if (
      canSaveCampaign() &&
      state.playMode === "solo" &&
      !state.creator &&
      state.lives <= 0
    ) {
      clearCampaignProgress();
    } else {
      saveCampaignProgress();
    }
    state.mode = "menu";
    state.level = null;
    state.creator = false;
    setCreatorTools(false);
    if (leaveNet) clearOnlineSession();
    showScreen("menu");
    setPlayChrome(false);
    hideControls();
    const goBtn = document.getElementById("levelGo");
    if (goBtn) goBtn.hidden = false;
    syncContinueUi();
    syncCoinUi();
    syncCreatorAccess();
  }

  function renderOnlineList() {
    if (!onlineListEl || !window.OnlineNet) return;
    absorbOnlinePlayersIntoBoard();
    const q = (onlineSearchEl && onlineSearchEl.value) || "";
    const all = OnlineNet.players.slice();
    // Always show everyone in the lobby; search only highlights / filters for invite
    const filtered = q.trim() ? OnlineNet.search(q) : all;
    const showList = filtered.length ? filtered : all;
    const titleEl = document.getElementById("onlineConnectedTitle");

    onlineListEl.innerHTML = "";
    if (titleEl) {
      titleEl.textContent =
        all.length === 0
          ? t("online_none")
          : t("online_connected_n", { n: all.length });
    }

    if (onlineEmptyEl) {
      if (all.length === 0) {
        onlineEmptyEl.classList.remove("hidden");
        onlineEmptyEl.textContent =
          t("online_nobody");
      } else if (q.trim() && filtered.length === 0) {
        onlineEmptyEl.classList.remove("hidden");
        onlineEmptyEl.textContent = t("online_not_found", { n: all.length, q: q.trim() });
      } else {
        onlineEmptyEl.classList.add("hidden");
      }
    }

    if (onlineStatusEl && OnlineNet.connected && !state.online) {
      onlineStatusEl.textContent =
        all.length === 0
          ? t("online_wait_friend", { n: OnlineNet.name })
          : t("online_can_invite", { n: OnlineNet.name, c: all.length });
    }

    showList.forEach((p) => {
      const row = document.createElement("div");
      row.className = "online-row";
      const nameWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "online-row-name";
      const dot = document.createElement("span");
      dot.className = "online-dot";
      dot.setAttribute("aria-hidden", "true");
      name.appendChild(dot);
      name.appendChild(document.createTextNode(p.name));
      const sub = document.createElement("div");
      sub.className = "online-row-sub";
      sub.textContent = t("invite_waiting");
      nameWrap.appendChild(name);
      nameWrap.appendChild(sub);
      const actions = document.createElement("div");
      actions.className = "online-row-actions";
      const inviteBtn = document.createElement("button");
      inviteBtn.type = "button";
      inviteBtn.className = "btn online";
      inviteBtn.textContent = t("invite_send");
      inviteBtn.onclick = () => sendInviteToPlayer(p);
      actions.appendChild(inviteBtn);
      row.appendChild(nameWrap);
      row.appendChild(actions);
      onlineListEl.appendChild(row);
    });
  }

  function sendInviteToPlayer(p) {
    if (!window.OnlineNet || !p) return;
    OnlineNet.invite(p.id);
    if (onlineStatusEl) {
      onlineStatusEl.textContent = t("invite_sending", { n: p.name });
    }
  }

  function sendInviteFromSearch() {
    if (!window.OnlineNet) return;
    const q = (onlineSearchEl && onlineSearchEl.value) || "";
    if (!q.trim()) {
      if (onlineStatusEl) {
        onlineStatusEl.textContent = t("invite_need_name");
      }
      return;
    }
    OnlineNet.inviteByQuery(q.trim());
    if (onlineStatusEl) {
      onlineStatusEl.textContent = t("invite_searching", { n: q.trim() });
    }
  }

  function showInvite(msg) {
    // Only show while on the invite lobby screen
    const onLobby =
      screens.online && !screens.online.classList.contains("hidden");
    if (!onLobby) return;

    state.pendingInviteId = msg.inviteId;
    if (!inviteToast) return;
    document.getElementById("inviteTitle").textContent = t("invite_title_dyn");
    document.getElementById("inviteBody").textContent =
      t("invite_from", { n: msg.fromName });
    inviteToast.classList.remove("hidden");
    sfx("invite");
  }

  function hideInvite() {
    state.pendingInviteId = null;
    if (inviteToast) inviteToast.classList.add("hidden");
  }

  function wrongServerHint() {
    const port = location.port || (location.protocol === "https:" ? "443" : "80");
    if (location.protocol === "file:") {
      return t("online_file");
    }
    if (port && port !== "8787") {
      return t("online_bad_port", { port });
    }
    return t("online_fail");
  }

  async function refreshWhoOnline() {
    try {
      const res = await fetch("/api/lobby", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const lobby = data.lobby || [];
      const titleEl = document.getElementById("onlineConnectedTitle");
      if (titleEl) {
        titleEl.textContent =
          lobby.length === 0
            ? t("online_none")
            : t("online_connected_n", { n: lobby.length });
      }
    } catch (_) {
      /* ignore */
    }
  }

  async function openOnlineLobby() {
    if (!requireValidP1Name()) {
      showScreen("menu");
      return;
    }
    showScreen("online");
    if (onlineStatusEl) onlineStatusEl.textContent = t("online_connecting");
    if (!window.OnlineNet) {
      if (onlineStatusEl) {
        onlineStatusEl.textContent =
          t("online_no_mod");
      }
      return;
    }
    if (location.protocol === "file:" || (location.port && location.port !== "8787")) {
      if (onlineStatusEl) onlineStatusEl.textContent = wrongServerHint();
      return;
    }
    try {
      await OnlineNet.connect(state.names[0]);
      OnlineNet.setLobbyStatus(true);
      OnlineNet.refreshLobby();
      syncMyScoreToBoards();
      if (onlineStatusEl) {
        onlineStatusEl.textContent = t("online_as", { n: OnlineNet.name, host: location.host });
      }
      renderOnlineList();
      refreshWhoOnline();
    } catch (err) {
      if (onlineStatusEl) onlineStatusEl.textContent = wrongServerHint();
    }
  }

  function startOnlineMatch(msg) {
    hideInvite();
    const amHost = msg.hostId === OnlineNet.id;
    state.online = true;
    state.onlineRole = amHost ? "host" : "guest";
    state.myPlayerId = amHost ? 0 : 1;
    // Real lobby names from each device — not the local "two players" form
    state.names[0] = msg.hostName || t("player");
    state.names[1] = msg.guestName || t("player2");
    // Ensure this device's slot matches what we connected with
    if (OnlineNet.name) {
      state.names[state.myPlayerId] = OnlineNet.name;
    }
    syncNameLabels();
    state.remoteInput = { x: 0, y: 0, throwQueued: false };
    startGame(msg.mode === "versus" ? "versus" : "coop", false);
  }

  function wireOnlineNet() {
    if (!window.OnlineNet) return;
    OnlineNet.on("lobby", () => renderOnlineList());
    OnlineNet.on("invite", (msg) => showInvite(msg));
    OnlineNet.on("invite_sent", (msg) => {
      if (onlineStatusEl) {
        onlineStatusEl.textContent = t("online_sent", { n: msg.toName });
      }
    });
    OnlineNet.on("invite_declined", (msg) => {
      if (onlineStatusEl) {
        onlineStatusEl.textContent = t("online_declined", { n: msg.byName });
      }
    });
    OnlineNet.on("room_start", (msg) => startOnlineMatch(msg));
    OnlineNet.on("input", (msg) => {
      if (!isOnlineHost()) return;
      state.remoteInput.x = Number(msg.x) || 0;
      state.remoteInput.y = Number(msg.y) || 0;
      if (msg.throw) state.remoteInput.throwQueued = true;
    });
    OnlineNet.on("state", (msg) => applyOnlineState(msg));
    OnlineNet.on("event", (msg) => {
      if (!isOnlineGuest()) return;
      if (msg.event === "intro") {
        if (msg.names && Array.isArray(msg.names) && msg.names.length >= 2) {
          // Keep my own name if host sends stale P2 form data
          const mine = state.names[state.myPlayerId];
          state.names = msg.names.slice();
          if (OnlineNet.name) state.names[state.myPlayerId] = OnlineNet.name;
          else if (mine) state.names[state.myPlayerId] = mine;
        }
        if (msg.versusScore) state.versusScore = msg.versusScore;
        state.playMode = msg.playMode || state.playMode;
        // Avoid re-broadcast loop: temporarily clear host role check by using guest path
        state.mode = "intro";
        loadLevel(msg.levelIndex | 0);
        const meta =
          state.playMode === "versus"
            ? localizeMeta(VERSUS_META[state.levelIndex])
            : campaignMeta(state.worldIndex, state.levelIndex);
        document.getElementById("levelTitleLabel").textContent =
          state.playMode === "versus"
            ? t("duel_n", { a: state.levelIndex + 1, b: VERSUS_LEVEL_COUNT })
            : state.levelIndex === 10
              ? t("final_boss")
              : t("level_n", { n: state.levelIndex + 1 });
        document.getElementById("levelTitle").textContent =
          state.playMode !== "versus" && state.levelIndex === 10
            ? bossLabel(state.worldIndex)
            : meta.name;
        document.getElementById("levelDesc").textContent =
          meta.desc + t("wait_host_start");
        const goBtn = document.getElementById("levelGo");
        if (goBtn) goBtn.hidden = true;
        showScreen("level");
        setPlayChrome(false);
        hideControls();
        syncNameLabels();
      } else if (msg.event === "play") {
        if (typeof msg.levelIndex === "number" && msg.levelIndex !== state.levelIndex) {
          loadLevel(msg.levelIndex);
        }
        beginPlayGuestMirror();
      } else if (msg.event === "fail") {
        state.lives = msg.lives;
        state.mode = "fail";
        document.getElementById("failTitle").textContent =
          state.playMode === "coop" ? t("fail_coop") : t("fail_title");
        document.getElementById("failMsg").textContent = msg.reason || t("game_over");
        document.getElementById("retryBtn").textContent = t("wait_host");
        showScreen("fail");
        if (pauseBtn) pauseBtn.hidden = true;
        hideControls();
      } else if (msg.event === "campaign_win") {
        state.mode = "win";
        document.getElementById("winEyebrow").textContent = t("win_eyebrow");
        document.getElementById("winTitle").textContent = t("escaped");
        document.getElementById("winMsg").textContent = t("escaped_coop");
        document.getElementById("againBtn").textContent = t("wait_host");
        showScreen("win");
        setPlayChrome(false);
        hideControls();
      } else if (msg.event === "versus_round") {
        state.versusScore = msg.versusScore || state.versusScore;
        state.versusFinal = !!msg.final;
        state.mode = "win";
        if (msg.final) {
          document.getElementById("winEyebrow").textContent = t("championship");
          document.getElementById("winTitle").textContent =
            t("champ", { n: playerName(msg.champId) });
          document.getElementById("winMsg").textContent =
            t("tourney_over", { a: state.versusScore[0], b: state.versusScore[1] });
          document.getElementById("againBtn").textContent = t("wait_host");
        } else {
          document.getElementById("winEyebrow").textContent =
            t("round_n", { n: (msg.levelIndex | 0) + 1 });
          document.getElementById("winTitle").textContent =
            t("round_won", { n: playerName(msg.winnerId) });
          document.getElementById("winMsg").textContent =
            t("round_score", { a: state.versusScore[0], b: state.versusScore[1] }).replace(/—.*$/, "— " + t("wait_host"));
          document.getElementById("againBtn").textContent = t("waiting");
        }
        showScreen("win");
        setPlayChrome(false);
        hideControls();
      } else if (msg.event === "menu") {
        returnToMenu(true);
      }
    });
    OnlineNet.on("peer_left", (msg) => {
      alert(t("friend_left", { n: msg.name || t("friend") }));
      returnToMenu(true);
      if (onlineStatusEl) onlineStatusEl.textContent = t("friend_dc");
    });
    OnlineNet.on("error", (msg) => {
      if (onlineStatusEl) onlineStatusEl.textContent = msg.message || t("error");
    });
    OnlineNet.on("disconnected", () => {
      if (state.online) {
        alert(t("server_dc"));
        returnToMenu(true);
      }
      if (onlineStatusEl) onlineStatusEl.textContent = t("server_offline");
    });
  }

  // --- UI buttons ---
  document.getElementById("onePlayerBtn").onclick = () => startFreshSolo();
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) continueBtn.onclick = () => continueCampaign();
  const newGameBtn = document.getElementById("newGameBtn");
  if (newGameBtn) {
    newGameBtn.onclick = () => {
      if (
        !confirm(t("confirm_reset"))
      ) {
        return;
      }
      startFreshSolo();
    };
  }
  const muteBtn = document.getElementById("muteBtn");
  if (muteBtn) {
    muteBtn.onclick = () => {
      if (window.Sfx) Sfx.toggleMute();
      syncMuteBtn();
    };
    syncMuteBtn();
  }
  document.getElementById("storyNext").onclick = () => {
    if (storyIndex < activeStoryPages.length - 1) {
      storyIndex += 1;
      renderStoryPage();
      return;
    }
    finishStoryAndStart();
  };
  document.getElementById("storySkip").onclick = () => finishStoryAndStart();
  document.getElementById("twoPlayersBtn").onclick = () => {
    if (!requireValidP1Name()) return;
    showScreen("twoPlayer");
  };
  document.getElementById("onlineBtn").onclick = () => openOnlineLobby();
  document.getElementById("onlineBack").onclick = () => {
    hideInvite();
    if (window.OnlineNet) OnlineNet.setLobbyStatus(false);
    showScreen("menu");
  };
  const onlineInviteBtn = document.getElementById("onlineInviteBtn");
  if (onlineInviteBtn) {
    onlineInviteBtn.onclick = () => sendInviteFromSearch();
  }
  if (onlineSearchEl) {
    onlineSearchEl.addEventListener("input", () => renderOnlineList());
    onlineSearchEl.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        sendInviteFromSearch();
      }
    });
  }
  function respondPendingInvite(accept, mode) {
    if (state.pendingInviteId && window.OnlineNet) {
      OnlineNet.respondInvite(state.pendingInviteId, accept, mode);
    }
    hideInvite();
  }
  const inviteCoopBtn = document.getElementById("inviteCoop");
  const inviteVersusBtn = document.getElementById("inviteVersus");
  if (inviteCoopBtn) {
    inviteCoopBtn.onclick = () => respondPendingInvite(true, "coop");
  }
  if (inviteVersusBtn) {
    inviteVersusBtn.onclick = () => respondPendingInvite(true, "versus");
  }
  document.getElementById("inviteDecline").onclick = () => {
    respondPendingInvite(false, "coop");
  };
  document.getElementById("twoPlayerBack").onclick = () => {
    saveNamesFromInputs();
    showScreen("menu");
  };
  document.getElementById("coopBtn").onclick = () => startGame("coop", false);
  document.getElementById("versusBtn").onclick = () => startGame("versus", false);
  document.getElementById("creatorBtn").onclick = () => {
    if (!isCreatorAllowed()) {
      syncCreatorAccess();
      return;
    }
    if (!requireValidP1Name()) return;
    openCreatorSelect();
  };
  document.getElementById("creatorBack").onclick = () => {
    state.creator = false;
    setCreatorTools(false);
    showScreen("menu");
    syncCreatorAccess();
  };
  document.getElementById("howtoBtn").onclick = () => showScreen("howto");
  document.getElementById("howtoBack").onclick = () => showScreen("menu");
  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) settingsBtn.onclick = () => openSettings(true);
  const settingsBack = document.getElementById("settingsBack");
  if (settingsBack) {
    settingsBack.onclick = () => {
      saveNamesFromInputs();
      syncMenuNameLine();
      showScreen("menu");
    };
  }
  const settingsSaveBtn = document.getElementById("settingsSaveBtn");
  if (settingsSaveBtn) settingsSaveBtn.onclick = () => saveSettingsName();
  const avatarSaveBtn = document.getElementById("avatarSaveBtn");
  if (avatarSaveBtn) {
    avatarSaveBtn.onclick = () => {
      saveAvatar(avatarDraft);
      sfx("bing");
      drawAvatarPreviews();
    };
  }
  const settingsMuteBtn = document.getElementById("settingsMuteBtn");
  if (settingsMuteBtn) {
    settingsMuteBtn.onclick = () => {
      if (window.Sfx) Sfx.toggleMute();
      syncMuteBtn();
    };
  }
  const langRow = document.getElementById("langRow");
  if (langRow) {
    langRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (!btn || !window.I18n) return;
      I18n.setLang(btn.getAttribute("data-lang"));
    });
  }
  if (window.I18n) {
    I18n.onChange(() => {
      syncMenuNameLine();
      syncCoinUi();
      syncMuteBtn();
      syncContinueUi();
      updateHud();
      updateBookUi();
      buildAvatarPicker();
      drawAvatarPreviews();
      if (state.mode === "story") renderStoryPage();
      buildWorldTabs();
      buildLevelGrid();
      // Refresh intro screen texts if sitting on a level card
      if (state.mode === "intro" && state.level) {
        const loc =
          state.playMode === "versus"
            ? localizeMeta(VERSUS_META[state.levelIndex])
            : campaignMeta(state.worldIndex, state.levelIndex);
        const isBoss =
          state.playMode !== "versus" &&
          state.levelIndex === LEVELS_PER_WORLD - 1;
        document.getElementById("levelTitle").textContent =
          isBoss ? bossLabel(state.worldIndex) : loc.name;
        let desc = loc.desc;
        if (state.playMode === "coop") desc += t("coop_door_hint");
        document.getElementById("levelDesc").textContent = desc;
        state.level.name = loc.name;
        state.level.desc = loc.desc;
      }
    });
    I18n.apply();
  }
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  if (leaderboardBtn) {
    leaderboardBtn.onclick = () => openLeaderboard();
  }
  const leaderboardBack = document.getElementById("leaderboardBack");
  if (leaderboardBack) {
    leaderboardBack.onclick = () => showScreen("menu");
  }
  document.getElementById("levelGo").onclick = () => {
    if (isOnlineGuest()) return;
    beginPlay();
  };
  document.getElementById("pauseBtn").onclick = () => {
    if (state.mode !== "play") return;
    if (state.online) return; // pause disabled in online for simplicity
    state.mode = "pause";
    showScreen("pause");
    hideControls();
  };
  document.getElementById("resumeBtn").onclick = () => beginPlay();
  document.getElementById("pickLevelBtn").onclick = () => openCreatorSelect();
  document.getElementById("skipBtn").onclick = () => {
    if (!state.creator) return;
    const last =
      state.playMode === "versus"
        ? VERSUS_LEVEL_COUNT - 1
        : LEVELS_PER_WORLD - 1;
    if (state.levelIndex >= last) {
      if (state.playMode === "versus") {
        versusWin(state.players[0] || makePlayer(0, 0, 0, 1, P1_PALETTE));
      } else if (state.worldIndex < WORLDS.length - 1) {
        state.worldIndex += 1;
        introLevel(0);
      } else {
        openCreatorSelect();
      }
      return;
    }
    introLevel(state.levelIndex + 1);
  };
  document.getElementById("quitBtn").onclick = () => {
    if (isOnlineHost()) netSendEvent({ event: "menu" });
    returnToMenu(true);
  };
  document.getElementById("retryBtn").onclick = () => {
    if (isOnlineGuest()) return;
    if (state.playMode === "solo" && !state.creator && state.lives <= 0) {
      // Restart from the beginning of the current world
      state.lives = 3;
      introLevel(0);
      return;
    }
    introLevel(state.levelIndex);
  };
  document.getElementById("failMenuBtn").onclick = () => {
    if (isOnlineHost()) netSendEvent({ event: "menu" });
    returnToMenu(true);
  };
  document.getElementById("againBtn").onclick = () => {
    if (isOnlineGuest()) return;
    if (state.creator) {
      openCreatorSelect();
      return;
    }
    if (state.playMode === "versus") {
      if (!state.versusFinal && state.levelIndex < VERSUS_LEVEL_COUNT - 1) {
        introLevel(state.levelIndex + 1);
        return;
      }
      startGame("versus", false);
      return;
    }
    startGame(state.playMode || "solo", false);
  };

  function wireThrowButton(btn, playerIndex) {
    if (!btn) return;
    const fire = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOnlineGuest()) {
        queueGuestThrow();
        return;
      }
      const idx = state.online ? localPlayerId() : playerIndex;
      const p = state.players[idx];
      if (p) throwBook(p);
    };
    btn.addEventListener("pointerdown", fire);
    btn.addEventListener("click", fire);
  }

  wireThrowButton(throwBtn1, 0);
  wireThrowButton(throwBtn2, 1);

  canvas.addEventListener("pointerdown", (e) => {
    if (state.mode !== "play") return;
    if (e.target !== canvas) return;

    if (state.online) {
      if (isOnlineGuest()) {
        queueGuestThrow();
      } else {
        const p = state.players[localPlayerId()];
        if (p) throwBook(p);
      }
      return;
    }

    // Dual: left half of screen = P1 throw, right half = P2 throw (works with touch too)
    if (isDual()) {
      const rect = canvas.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      if (e.clientX < mid) {
        if (state.players[0]) throwBook(state.players[0]);
      } else {
        if (state.players[1]) throwBook(state.players[1]);
      }
      return;
    }

    // Solo: mouse click only (mobile uses 📖 button)
    if (e.pointerType === "touch") return;
    if (state.players[0]) throwBook(state.players[0]);
  });

  function wireNameInput(el) {
    if (!el) return;
    el.addEventListener("input", () => {
      const val = el.value.trim();
      const ok = isValidPlayerName(val);
      el.classList.toggle("invalid", !ok);
      if (el === nameInputP1 || el === nameInputP1b) {
        if (!val) {
          markNameValidity(false, t("name_need"));
        } else if (!ok) {
          markNameValidity(
            false,
            t("name_digits_short", { n: digitCount(val) })
          );
        } else {
          markNameValidity(true, t("name_ok"));
        }
      }
    });
    el.addEventListener("change", saveNamesFromInputs);
    el.addEventListener("blur", saveNamesFromInputs);
    el.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
        saveNamesFromInputs();
      }
    });
  }
  wireNameInput(nameInputP1);
  wireNameInput(nameInputP1b);
  wireNameInput(nameInputP2);

  // Keep P1 fields in sync while typing
  if (nameInputP1 && nameInputP1b) {
    nameInputP1.addEventListener("input", () => {
      nameInputP1b.value = nameInputP1.value;
    });
    nameInputP1b.addEventListener("input", () => {
      nameInputP1.value = nameInputP1b.value;
    });
  }

  loadNames();
  avatarDraft = loadAvatar();
  drawAvatarPreviews();
  wireOnlineNet();

  buildLevelGrid();

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => {
    setTimeout(resize, 120);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resize);
  }

  document.body.addEventListener(
    "touchmove",
    (e) => {
      // Only lock scrolling during active play (prevents page bounce over the canvas)
      if (state.mode !== "play") return;
      // Never block joysticks / throw buttons
      if (
        e.target.closest(
          "#controls, .joystick-base, .joystick-knob, .player-pad, .throw-btn, .menu-scroll, .panel, .howto-list, .level-grid, .online-list, .leaderboard-list, .name-input, #storyScreen, .world-tabs, .lang-row, .screen"
        )
      ) {
        return;
      }
      e.preventDefault();
    },
    { passive: false }
  );

  resize();
  if (window.I18n) I18n.apply();
  showScreen("menu");
  syncContinueUi();
  syncCreatorAccess();
  syncMenuNameLine();
  syncCoinUi();
  window.addEventListener("pagehide", () => {
    if (state.lives > 0) saveCampaignProgress();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && state.lives > 0) {
      saveCampaignProgress();
    }
  });
  tick();
})();
