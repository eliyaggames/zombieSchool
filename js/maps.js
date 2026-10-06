/* Tile codes:
   0 empty, 1 wall, 2 spawn, 3 exit, 4 key, 5 zombie spawn, 7 boss spawn
*/
const TILE = { EMPTY: 0, WALL: 1, SPAWN: 2, EXIT: 3, KEY: 4, ZOMBIE: 5, LOCKER: 6, BOSS: 7, SPAWN2: 8 };

const LEVEL_META = [
  {
    nameHe: "הפעמון הראשון",
    descHe: "מורה אחד התעורר. מצא מפתח וברח!",
    nameEn: "First Bell",
    descEn: "One teacher woke up. Find the key and escape!",
    theme: "foyer",
  },
  {
    nameHe: "מסדרון א׳",
    descHe: "שני מורים זומבים במסדרון.",
    nameEn: "Hallway A",
    descEn: "Two zombie teachers in the hallway.",
    theme: "corridor",
  },
  {
    nameHe: "חדר מחשבים",
    descHe: "המעבדה ננעלה. תזדרז!",
    nameEn: "Computer Lab",
    descEn: "The lab is locked. Hurry!",
    theme: "computers",
  },
  {
    nameHe: "חדר מורים",
    descHe: "הם רעבים... ורצים מהר יותר.",
    nameEn: "Teachers' Room",
    descEn: "They're hungry… and faster.",
    theme: "teachers",
  },
  {
    nameHe: "חצר פנימית",
    descHe: "כוח חדש! זרוק ספרים 📖 — מורה שנפגע קופא ל־5 שניות.",
    nameEn: "Courtyard",
    descEn: "New power! Throw books 📖 — a hit freezes a teacher for 5 seconds.",
    theme: "yard",
  },
  {
    nameHe: "קומה שנייה",
    descHe: "מבוך של כיתות. השתמש בספרים!",
    nameEn: "Second Floor",
    descEn: "A maze of classrooms. Use your books!",
    theme: "classroom",
  },
  {
    nameHe: "ספרייה",
    descHe: "שקט מדי. יותר מדי זומבים — יש לך ספרים.",
    nameEn: "Library",
    descEn: "Too quiet. Too many zombies — you've got books.",
    theme: "library",
  },
  {
    nameHe: "חדר כימיה",
    descHe: "הזומבים מהירים — עצור אותם בספרים.",
    nameEn: "Chemistry Room",
    descEn: "Zombies are fast — stop them with books.",
    theme: "chemistry",
  },
  {
    nameHe: "אולם ספורט",
    descHe: "ריצה לחיים! ספרים יעזרו לך.",
    nameEn: "Gym",
    descEn: "Run for your life! Books will help.",
    theme: "gym",
  },
  {
    nameHe: "לפני היציאה",
    descHe: "הדלת הראשית קרובה... כמעט.",
    nameEn: "Near the Exit",
    descEn: "The main door is close… almost.",
    theme: "lobby",
  },
  {
    nameHe: "המנהל הזמבי",
    descHe: "בוס סופי! זרוק ספרים, אסוף 3 מפתחות וברח!",
    nameEn: "Zombie Principal",
    descEn: "Final boss! Throw books, collect 3 keys, and escape!",
    theme: "office",
  },
];


/** Pick Hebrew or English name/desc from a bilingual meta object */
function localizeMeta(meta) {
  if (!meta) return meta;
  let lang = "he";
  try {
    if (typeof I18n !== "undefined" && I18n.getLang) lang = I18n.getLang();
    else if (typeof window !== "undefined" && window.I18n && window.I18n.getLang)
      lang = window.I18n.getLang();
    else if (typeof document !== "undefined" && document.documentElement)
      lang = document.documentElement.lang || "he";
  } catch (_) {}
  const he = lang === "he";
  return {
    ...meta,
    name: he
      ? meta.nameHe || meta.name || meta.nameEn || ""
      : meta.nameEn || meta.name || meta.nameHe || "",
    desc: he
      ? meta.descHe || meta.desc || meta.descEn || ""
      : meta.descEn || meta.desc || meta.descHe || "",
  };
}

const THEMES = {
  foyer: {
    floorA: "#2a3328",
    floorB: "#243024",
    wall: "#4a5540",
    wallTop: "#6a7860",
    accent: "#c4a35a",
  },
  corridor: {
    floorA: "#2b2f36",
    floorB: "#252930",
    wall: "#3d4654",
    wallTop: "#5a6578",
    accent: "#3d7ea6",
  },
  computers: {
    floorA: "#1a2438",
    floorB: "#152032",
    wall: "#2a3d5c",
    wallTop: "#3d5a82",
    accent: "#4ec4f0",
  },
  teachers: {
    floorA: "#3a2e28",
    floorB: "#322822",
    wall: "#5c4034",
    wallTop: "#7a5848",
    accent: "#d4a574",
  },
  yard: {
    floorA: "#2a4a28",
    floorB: "#244222",
    wall: "#5a6a4a",
    wallTop: "#7a8e62",
    accent: "#8fbf5a",
  },
  classroom: {
    floorA: "#3a3428",
    floorB: "#322e24",
    wall: "#4a6a5a",
    wallTop: "#628878",
    accent: "#2d5a4a",
  },
  library: {
    floorA: "#3a2a1e",
    floorB: "#322418",
    wall: "#5c3a28",
    wallTop: "#7a5238",
    accent: "#c9a227",
  },
  chemistry: {
    floorA: "#1e2e2e",
    floorB: "#182626",
    wall: "#2a4848",
    wallTop: "#3a6868",
    accent: "#50e0a0",
  },
  gym: {
    floorA: "#4a3420",
    floorB: "#40301c",
    wall: "#6a4a30",
    wallTop: "#8a6440",
    accent: "#e07040",
  },
  basketball: {
    floorA: "#c45a28",
    floorB: "#b04e22",
    wall: "#3a4550",
    wallTop: "#5a6878",
    accent: "#f0e8d8",
  },
  pool: {
    floorA: "#1a6a8a",
    floorB: "#155e7a",
    wall: "#2a4858",
    wallTop: "#3a6070",
    accent: "#7ec8ff",
  },
  track: {
    floorA: "#a03828",
    floorB: "#8e3022",
    wall: "#4a5040",
    wallTop: "#6a7058",
    accent: "#f0f0e8",
  },
  locker: {
    floorA: "#2a3038",
    floorB: "#242830",
    wall: "#4a5560",
    wallTop: "#6a7888",
    accent: "#c0d0d8",
  },
  bleachers: {
    floorA: "#3a3428",
    floorB: "#322e24",
    wall: "#5a4030",
    wallTop: "#7a5840",
    accent: "#e07040",
  },
  storage: {
    floorA: "#3a3228",
    floorB: "#322a22",
    wall: "#5a4838",
    wallTop: "#7a6448",
    accent: "#f0b429",
  },
  music: {
    floorA: "#2a1e38",
    floorB: "#241832",
    wall: "#4a3060",
    wallTop: "#6a4880",
    accent: "#e878d0",
  },
  concert: {
    floorA: "#1a1520",
    floorB: "#141018",
    wall: "#3a2a48",
    wallTop: "#5a4070",
    accent: "#f0b429",
  },
  studio: {
    floorA: "#121418",
    floorB: "#0e1014",
    wall: "#2a3038",
    wallTop: "#3a4850",
    accent: "#4ec4f0",
  },
  piano: {
    floorA: "#2e2418",
    floorB: "#261e14",
    wall: "#4a3828",
    wallTop: "#6a5040",
    accent: "#e8e0d0",
  },
  reactor: {
    floorA: "#2a1810",
    floorB: "#22140c",
    wall: "#5a3020",
    wallTop: "#7a4830",
    accent: "#e07040",
  },
  fog: {
    floorA: "#2a3848",
    floorB: "#243040",
    wall: "#4a5868",
    wallTop: "#6a7888",
    accent: "#a0c0d8",
  },
  storm: {
    floorA: "#1a1e38",
    floorB: "#141830",
    wall: "#2a3058",
    wallTop: "#3a4080",
    accent: "#f0d878",
  },
  cloud: {
    floorA: "#3a5068",
    floorB: "#324858",
    wall: "#6888a8",
    wallTop: "#88a8c8",
    accent: "#e8f4ff",
  },
  cage: {
    floorA: "#2a2e32",
    floorB: "#242830",
    wall: "#4a5058",
    wallTop: "#6a7078",
    accent: "#c0c8d0",
  },
  lobby: {
    floorA: "#2a3038",
    floorB: "#242830",
    wall: "#4a5560",
    wallTop: "#6a7888",
    accent: "#f0b429",
  },
  office: {
    floorA: "#2a1e28",
    floorB: "#241820",
    wall: "#4a3048",
    wallTop: "#6a4868",
    accent: "#f0b429",
  },
};

function buildRect(w, h, fill = 0) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function stampBorder(map) {
  const h = map.length;
  const w = map[0].length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) map[y][x] = TILE.WALL;
    }
  }
}

function put(map, x, y, t) {
  if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) map[y][x] = t;
}

function wallH(map, y, x1, x2) {
  for (let x = x1; x <= x2; x++) put(map, x, y, TILE.WALL);
}

function wallV(map, x, y1, y2) {
  for (let y = y1; y <= y2; y++) put(map, x, y, TILE.WALL);
}

/** Open a doorway so the maze stays solvable */
function door(map, x, y) {
  put(map, x, y, TILE.EMPTY);
}

/** Place spawn / zombies / key / exit (and optional boss) */
function placeActors(map, spawn, zombies, key, exit, boss) {
  put(map, spawn[0], spawn[1], TILE.SPAWN);
  for (const [x, y] of zombies) put(map, x, y, TILE.ZOMBIE);
  if (Array.isArray(key[0])) {
    for (const [x, y] of key) put(map, x, y, TILE.KEY);
  } else {
    put(map, key[0], key[1], TILE.KEY);
  }
  put(map, exit[0], exit[1], TILE.EXIT);
  if (boss) put(map, boss[0], boss[1], TILE.BOSS);
}

/** World 1 — בית הספר (מקורי) */
function layoutsWorldSchool(map) {
  return [
    () => {
      wallV(map, 7, 1, 10);
      door(map, 7, 5);
      wallH(map, 10, 1, 5);
      wallH(map, 14, 8, 13);
      door(map, 10, 14);
      placeActors(map, [2, 2], [[12, 3]], [3, 18], [12, 20]);
    },
    () => {
      wallV(map, 4, 2, 12);
      door(map, 4, 6);
      wallV(map, 10, 8, 20);
      door(map, 10, 14);
      wallH(map, 8, 4, 10);
      door(map, 7, 8);
      placeActors(map, [2, 2], [[7, 4], [12, 12]], [2, 16], [12, 20]);
    },
    () => {
      for (let i = 2; i < 13; i += 3) {
        wallV(map, i, 3, 8);
        door(map, i, 5);
      }
      wallH(map, 12, 2, 12);
      door(map, 4, 12);
      door(map, 10, 12);
      wallV(map, 7, 12, 18);
      door(map, 7, 15);
      placeActors(map, [1, 1], [[5, 5], [11, 5], [3, 15]], [12, 15], [1, 20]);
    },
    () => {
      wallH(map, 5, 1, 11);
      wallH(map, 10, 3, 13);
      wallH(map, 15, 1, 11);
      wallV(map, 7, 6, 9);
      door(map, 7, 7);
      wallV(map, 7, 11, 14);
      door(map, 7, 13);
      placeActors(
        map,
        [2, 2],
        [[12, 2], [2, 12], [12, 12], [7, 18]],
        [12, 18],
        [2, 20]
      );
    },
    () => {
      for (let y = 3; y < 19; y += 4) {
        wallH(map, y, 2, 6);
        door(map, 4, y);
        wallH(map, y + 2, 8, 12);
        door(map, 10, y + 2);
      }
      placeActors(
        map,
        [1, 1],
        [[7, 5], [3, 9], [11, 11], [5, 15]],
        [12, 3],
        [7, 20]
      );
    },
    () => {
      for (let x = 3; x <= 11; x += 2) wallV(map, x, 2, 19);
      door(map, 3, 4);
      door(map, 5, 8);
      door(map, 7, 4);
      door(map, 9, 12);
      door(map, 11, 8);
      door(map, 3, 14);
      door(map, 5, 18);
      door(map, 7, 16);
      door(map, 9, 6);
      door(map, 11, 18);
      placeActors(
        map,
        [1, 1],
        [[4, 10], [8, 4], [6, 16], [10, 12], [12, 18]],
        [13, 2],
        [1, 20]
      );
    },
    () => {
      wallH(map, 4, 1, 11);
      door(map, 12, 4);
      wallH(map, 8, 3, 13);
      door(map, 1, 8);
      door(map, 2, 8);
      wallH(map, 12, 1, 11);
      door(map, 12, 12);
      wallH(map, 16, 3, 13);
      door(map, 1, 16);
      door(map, 2, 16);
      wallV(map, 6, 4, 16);
      door(map, 6, 6);
      door(map, 6, 10);
      door(map, 6, 14);
      placeActors(
        map,
        [2, 2],
        [[12, 2], [2, 6], [12, 10], [2, 14]],
        [12, 18],
        [2, 20]
      );
    },
    () => {
      for (let i = 0; i < 5; i++) {
        const x = 2 + i * 2;
        wallV(map, x, 2, 19);
        door(map, x, 4 + (i % 3) * 5);
        door(map, x, 17 - (i % 2) * 4);
      }
      placeActors(
        map,
        [1, 11],
        [[3, 4], [5, 14], [7, 6], [9, 16], [11, 8], [13, 12], [7, 18]],
        [13, 2],
        [13, 20]
      );
    },
    () => {
      wallH(map, 6, 1, 13);
      door(map, 3, 6);
      door(map, 11, 6);
      wallH(map, 12, 1, 13);
      door(map, 6, 12);
      door(map, 7, 12);
      door(map, 8, 12);
      wallV(map, 7, 1, 5);
      door(map, 7, 3);
      wallV(map, 7, 14, 20);
      door(map, 7, 16);
      placeActors(
        map,
        [1, 2],
        [[4, 3], [10, 3], [2, 9], [12, 9], [4, 15], [10, 15], [2, 18], [12, 18]],
        [13, 9],
        [1, 20]
      );
    },
    () => {
      for (let y = 3; y < 20; y += 3) {
        wallH(map, y, 1, 5);
        door(map, 3, y);
        wallH(map, y + 1, 9, 13);
        door(map, 11, y + 1);
      }
      wallV(map, 7, 2, 19);
      door(map, 7, 5);
      door(map, 7, 11);
      door(map, 7, 17);
      placeActors(
        map,
        [1, 1],
        [
          [3, 5],
          [11, 2],
          [5, 8],
          [12, 8],
          [2, 12],
          [10, 14],
          [4, 17],
          [12, 17],
          [9, 20],
          [3, 20],
        ],
        [12, 4],
        [13, 20]
      );
    },
    () => {
      for (let y = 4; y < 18; y++) {
        put(map, 4, y, y % 3 === 0 ? TILE.EMPTY : TILE.WALL);
        put(map, 10, y, y % 3 === 1 ? TILE.EMPTY : TILE.WALL);
      }
      door(map, 4, 6);
      door(map, 4, 12);
      door(map, 4, 16);
      door(map, 10, 5);
      door(map, 10, 11);
      door(map, 10, 15);
      wallH(map, 8, 1, 3);
      door(map, 2, 8);
      wallH(map, 8, 11, 13);
      door(map, 12, 8);
      wallH(map, 14, 5, 9);
      door(map, 7, 14);
      placeActors(
        map,
        [7, 20],
        [[2, 16], [12, 16], [2, 10], [12, 10]],
        [[2, 2], [12, 2], [7, 11]],
        [7, 1],
        [7, 3]
      );
    },
  ];
}

/** World 2 — אגף המוזיקה: חדרי חזרות + במה מרכזית */
function layoutsWorldMusic(map) {
  return [
    () => {
      // שני חדרים זה לצד זה
      wallV(map, 7, 1, 20);
      door(map, 7, 10);
      wallH(map, 11, 1, 6);
      door(map, 3, 11);
      placeActors(map, [2, 2], [[12, 4]], [12, 18], [2, 20]);
    },
    () => {
      // טבעת פנימית (אולם קונצרטים)
      wallH(map, 5, 3, 11);
      wallH(map, 16, 3, 11);
      wallV(map, 3, 5, 16);
      wallV(map, 11, 5, 16);
      door(map, 7, 5);
      door(map, 7, 16);
      door(map, 3, 10);
      door(map, 11, 10);
      placeActors(map, [1, 1], [[7, 8], [7, 13]], [7, 10], [13, 20]);
    },
    () => {
      // X של קירות אלכסוניים (מסודרים כמדרגות)
      for (let i = 0; i < 6; i++) {
        put(map, 2 + i, 3 + i, TILE.WALL);
        put(map, 12 - i, 3 + i, TILE.WALL);
        put(map, 2 + i, 18 - i, TILE.WALL);
        put(map, 12 - i, 18 - i, TILE.WALL);
      }
      door(map, 7, 8);
      door(map, 7, 13);
      placeActors(map, [1, 10], [[4, 4], [10, 4], [4, 17]], [13, 10], [7, 20]);
    },
    () => {
      // שלושה תאים אופקיים
      wallH(map, 7, 1, 13);
      wallH(map, 14, 1, 13);
      door(map, 2, 7);
      door(map, 12, 7);
      door(map, 7, 14);
      wallV(map, 5, 1, 6);
      door(map, 5, 3);
      wallV(map, 9, 8, 13);
      door(map, 9, 11);
      placeActors(
        map,
        [1, 2],
        [[12, 3], [3, 10], [12, 17]],
        [1, 17],
        [13, 20]
      );
    },
    () => {
      // עמודים כמו תווים
      for (const [x, y] of [
        [3, 4],
        [5, 7],
        [7, 4],
        [9, 7],
        [11, 4],
        [3, 12],
        [5, 15],
        [7, 12],
        [9, 15],
        [11, 12],
        [4, 18],
        [10, 18],
      ]) {
        put(map, x, y, TILE.WALL);
      }
      wallH(map, 10, 1, 5);
      door(map, 3, 10);
      wallH(map, 10, 9, 13);
      door(map, 11, 10);
      placeActors(
        map,
        [1, 1],
        [[6, 6], [12, 8], [2, 14], [8, 16]],
        [13, 2],
        [7, 20]
      );
    },
    () => {
      // מסדרון ספירלי רך
      wallH(map, 3, 1, 11);
      door(map, 12, 3);
      wallV(map, 12, 3, 17);
      door(map, 12, 18);
      wallH(map, 18, 3, 12);
      door(map, 2, 18);
      wallV(map, 3, 6, 18);
      door(map, 3, 5);
      wallH(map, 6, 3, 9);
      door(map, 10, 6);
      wallV(map, 9, 6, 14);
      door(map, 9, 15);
      placeActors(
        map,
        [1, 1],
        [[6, 4], [11, 10], [5, 12], [7, 16]],
        [6, 10],
        [1, 20]
      );
    },
    () => {
      // ארבעה חדרי פינה + מרכז פתוח
      for (const [x0, y0] of [
        [1, 1],
        [9, 1],
        [1, 14],
        [9, 14],
      ]) {
        wallH(map, y0 + 5, x0, x0 + 4);
        wallV(map, x0 + 4, y0, y0 + 5);
      }
      door(map, 3, 6);
      door(map, 11, 6);
      door(map, 3, 14);
      door(map, 11, 14);
      placeActors(
        map,
        [2, 2],
        [[11, 3], [2, 16], [11, 16], [7, 10]],
        [12, 10],
        [7, 20]
      );
    },
    () => {
      // במת קונצרט: שורות ישיבה
      for (let y = 4; y <= 16; y += 3) {
        wallH(map, y, 2, 5);
        wallH(map, y, 9, 12);
        door(map, 3, y);
        door(map, 11, y);
      }
      wallV(map, 7, 2, 19);
      door(map, 7, 6);
      door(map, 7, 12);
      door(map, 7, 18);
      placeActors(
        map,
        [1, 20],
        [[3, 2], [11, 2], [4, 8], [10, 8], [3, 14], [11, 14]],
        [13, 10],
        [7, 1]
      );
    },
    () => {
      // חדר מקהלה — שני אגפים
      wallV(map, 5, 1, 20);
      wallV(map, 9, 1, 20);
      for (let y of [4, 8, 12, 16]) {
        door(map, 5, y);
        door(map, 9, y + 1);
      }
      placeActors(
        map,
        [7, 2],
        [[2, 5], [12, 6], [2, 12], [12, 13], [2, 18]],
        [7, 18],
        [7, 20]
      );
    },
    () => {
      // לפני הבמה — חצי עיגול מקירות
      wallH(map, 8, 1, 13);
      door(map, 7, 8);
      for (let i = 0; i < 5; i++) {
        wallV(map, 2 + i, 9 + i, 20);
        wallV(map, 12 - i, 9 + i, 20);
      }
      door(map, 4, 12);
      door(map, 10, 12);
      door(map, 7, 15);
      placeActors(
        map,
        [1, 2],
        [[3, 4], [11, 4], [6, 11], [8, 13], [4, 18]],
        [12, 2],
        [7, 20]
      );
    },
    () => {
      // בוס מוזיקה — במה פתוחה עם כנפיים
      wallV(map, 3, 4, 16);
      wallV(map, 11, 4, 16);
      for (let y of [6, 10, 14]) {
        door(map, 3, y);
        door(map, 11, y);
      }
      wallH(map, 5, 4, 10);
      door(map, 7, 5);
      wallH(map, 17, 4, 10);
      door(map, 7, 17);
      placeActors(
        map,
        [7, 20],
        [[1, 8], [13, 8], [1, 14], [13, 14]],
        [[2, 2], [12, 2], [7, 10]],
        [7, 1],
        [7, 3]
      );
    },
  ];
}

/** World 3 — ספורט: מסלולים מקבילים ומגרשים */
function layoutsWorldSports(map) {
  return [
    () => {
      wallV(map, 5, 1, 20);
      wallV(map, 9, 1, 20);
      door(map, 5, 6);
      door(map, 9, 12);
      door(map, 5, 16);
      placeActors(map, [2, 2], [[7, 8], [12, 14]], [12, 2], [2, 20]);
    },
    () => {
      // מגרש כדורסל — קווים אופקיים
      for (let y of [4, 8, 12, 16]) {
        wallH(map, y, 1, 4);
        wallH(map, y, 10, 13);
        door(map, 2, y);
        door(map, 12, y);
      }
      placeActors(map, [7, 1], [[3, 6], [11, 6], [3, 14], [11, 14]], [7, 10], [7, 20]);
    },
    () => {
      // חדר כושר — תאים קטנים
      for (let x = 2; x <= 12; x += 3) {
        for (let y = 2; y <= 16; y += 4) {
          wallH(map, y + 2, x, x + 2);
          wallV(map, x + 2, y, y + 2);
          door(map, x + 1, y + 2);
        }
      }
      placeActors(
        map,
        [1, 1],
        [[4, 4], [10, 4], [4, 12], [10, 12], [7, 16]],
        [13, 18],
        [1, 20]
      );
    },
    () => {
      // מסלול ריצה — נחש ארוך
      wallH(map, 4, 1, 12);
      door(map, 13, 4);
      wallH(map, 8, 2, 13);
      door(map, 1, 8);
      wallH(map, 12, 1, 12);
      door(map, 13, 12);
      wallH(map, 16, 2, 13);
      door(map, 1, 16);
      placeActors(
        map,
        [1, 1],
        [[6, 2], [10, 6], [4, 10], [11, 14], [5, 18]],
        [13, 18],
        [7, 20]
      );
    },
    () => {
      // בריכה — מסגרת פנימית גדולה
      wallH(map, 5, 2, 12);
      wallH(map, 16, 2, 12);
      wallV(map, 2, 5, 16);
      wallV(map, 12, 5, 16);
      door(map, 7, 5);
      door(map, 7, 16);
      door(map, 2, 10);
      door(map, 12, 10);
      wallV(map, 7, 7, 14);
      door(map, 7, 10);
      placeActors(
        map,
        [1, 2],
        [[4, 8], [10, 8], [4, 13], [10, 13]],
        [13, 2],
        [13, 20]
      );
    },
    () => {
      // מסלולים אנכיים צפופים
      for (let x = 2; x <= 12; x += 2) wallV(map, x, 2, 19);
      for (let i = 0; i < 6; i++) {
        door(map, 2 + i * 2, 3 + (i % 4) * 4);
        door(map, 2 + i * 2, 18 - (i % 3) * 3);
      }
      placeActors(
        map,
        [1, 10],
        [[3, 5], [5, 12], [7, 6], [9, 15], [11, 8], [13, 14]],
        [13, 2],
        [1, 20]
      );
    },
    () => {
      // מחסן — תיבות
      for (let y = 3; y <= 17; y += 5) {
        for (let x = 2; x <= 10; x += 4) {
          wallH(map, y, x, x + 2);
          wallH(map, y + 2, x, x + 2);
          wallV(map, x, y, y + 2);
          wallV(map, x + 2, y, y + 2);
          door(map, x + 1, y);
        }
      }
      placeActors(
        map,
        [1, 1],
        [[5, 5], [11, 5], [5, 12], [11, 12], [7, 18]],
        [13, 10],
        [7, 20]
      );
    },
    () => {
      // יציע — מדרגות צד
      wallV(map, 4, 1, 20);
      wallV(map, 10, 1, 20);
      for (let y = 3; y <= 18; y += 3) {
        door(map, 4, y);
        door(map, 10, y + 1);
      }
      wallH(map, 11, 5, 9);
      door(map, 7, 11);
      placeActors(
        map,
        [7, 2],
        [[2, 4], [12, 5], [2, 12], [12, 13], [2, 18], [12, 18]],
        [7, 14],
        [7, 20]
      );
    },
    () => {
      // מנהרה בצורת S
      wallH(map, 5, 1, 10);
      door(map, 11, 5);
      wallV(map, 11, 5, 10);
      door(map, 11, 11);
      wallH(map, 11, 4, 11);
      door(map, 3, 11);
      wallV(map, 3, 11, 16);
      door(map, 3, 17);
      wallH(map, 17, 3, 13);
      door(map, 12, 17);
      placeActors(
        map,
        [1, 2],
        [[6, 3], [12, 8], [6, 13], [10, 15], [5, 19]],
        [13, 2],
        [13, 20]
      );
    },
    () => {
      // לפני המגרש — פתוח עם מחסומים
      for (let i = 0; i < 4; i++) {
        wallH(map, 4 + i * 4, 2 + (i % 2) * 3, 8 + (i % 2) * 3);
        door(map, 5 + (i % 2) * 3, 4 + i * 4);
      }
      placeActors(
        map,
        [1, 1],
        [[12, 3], [3, 7], [11, 9], [4, 13], [10, 17], [6, 19]],
        [13, 12],
        [7, 20]
      );
    },
    () => {
      // בוס ספורט — מגרש עם שערים
      wallH(map, 6, 1, 5);
      wallH(map, 6, 9, 13);
      wallH(map, 15, 1, 5);
      wallH(map, 15, 9, 13);
      door(map, 3, 6);
      door(map, 11, 6);
      door(map, 3, 15);
      door(map, 11, 15);
      wallV(map, 7, 7, 14);
      door(map, 7, 10);
      placeActors(
        map,
        [7, 20],
        [[2, 9], [12, 9], [2, 13], [12, 13]],
        [[1, 2], [13, 2], [7, 12]],
        [7, 1],
        [7, 3]
      );
    },
  ];
}

/** World 4 — כימיה: רשת מעבדות */
function layoutsWorldChem(map) {
  return [
    () => {
      wallH(map, 10, 1, 13);
      door(map, 4, 10);
      wallV(map, 7, 1, 9);
      door(map, 7, 5);
      placeActors(map, [2, 2], [[12, 5], [3, 15]], [12, 18], [2, 20]);
    },
    () => {
      // רשת 3×3 תאים
      for (let x of [5, 9]) wallV(map, x, 1, 20);
      for (let y of [7, 14]) wallH(map, y, 1, 13);
      door(map, 5, 4);
      door(map, 9, 10);
      door(map, 5, 17);
      door(map, 9, 17);
      door(map, 3, 7);
      door(map, 7, 7);
      door(map, 11, 7);
      door(map, 7, 14);
      placeActors(
        map,
        [2, 2],
        [[7, 4], [12, 4], [2, 10], [12, 11], [7, 17]],
        [12, 18],
        [2, 20]
      );
    },
    () => {
      // מסדרון מרכזי + מדפים
      wallV(map, 6, 2, 19);
      wallV(map, 8, 2, 19);
      for (let y = 3; y <= 18; y += 3) {
        door(map, 6, y);
        door(map, 8, y + 1);
        wallH(map, y, 1, 5);
        wallH(map, y + 1, 9, 13);
      }
      placeActors(
        map,
        [7, 1],
        [[2, 5], [12, 6], [2, 12], [12, 13], [2, 18]],
        [7, 18],
        [7, 20]
      );
    },
    () => {
      // כור — עיגול מקירות במרכז
      for (let x = 4; x <= 10; x++) {
        put(map, x, 6, TILE.WALL);
        put(map, x, 14, TILE.WALL);
      }
      for (let y = 6; y <= 14; y++) {
        put(map, 4, y, TILE.WALL);
        put(map, 10, y, TILE.WALL);
      }
      door(map, 7, 6);
      door(map, 7, 14);
      door(map, 4, 10);
      door(map, 10, 10);
      placeActors(
        map,
        [1, 2],
        [[2, 8], [12, 8], [2, 16], [12, 16], [7, 10]],
        [13, 2],
        [13, 20]
      );
    },
    () => {
      // איי מבחנות — בלוקים + מעברי צד (לא זיגזג)
      for (const [x, y] of [
        [3, 3], [4, 3], [3, 4], [4, 4],
        [10, 3], [11, 3], [10, 4], [11, 4],
        [3, 9], [4, 9], [3, 10], [4, 10],
        [10, 9], [11, 9], [10, 10], [11, 10],
        [3, 15], [4, 15], [3, 16], [4, 16],
        [10, 15], [11, 15], [10, 16], [11, 16],
        [7, 6], [6, 12], [8, 12], [7, 18],
      ]) {
        put(map, x, y, TILE.WALL);
      }
      wallH(map, 7, 1, 5);
      wallH(map, 7, 9, 13);
      door(map, 2, 7);
      door(map, 12, 7);
      wallH(map, 13, 1, 5);
      wallH(map, 13, 9, 13);
      door(map, 2, 13);
      door(map, 12, 13);
      placeActors(
        map,
        [1, 1],
        [[6, 4], [12, 5], [1, 10], [13, 11], [5, 17], [12, 18]],
        [13, 2],
        [7, 20]
      );
    },
    () => {
      // מעבדות זוגיות
      for (let y of [4, 9, 14]) {
        wallH(map, y, 1, 13);
        door(map, 3, y);
        door(map, 11, y);
      }
      wallV(map, 7, 1, 20);
      door(map, 7, 6);
      door(map, 7, 11);
      door(map, 7, 16);
      placeActors(
        map,
        [1, 2],
        [[3, 6], [11, 6], [3, 11], [11, 12], [3, 17], [11, 17]],
        [12, 2],
        [12, 20]
      );
    },
    () => {
      // מסדרון אדים — קירות שבריריים
      for (let y = 2; y < 20; y++) {
        if (y % 4 !== 0) put(map, 4, y, TILE.WALL);
        if (y % 4 !== 2) put(map, 10, y, TILE.WALL);
      }
      door(map, 4, 5);
      door(map, 4, 12);
      door(map, 4, 18);
      door(map, 10, 3);
      door(map, 10, 9);
      door(map, 10, 15);
      placeActors(
        map,
        [1, 1],
        [[2, 7], [7, 5], [12, 8], [7, 12], [2, 16], [12, 17]],
        [13, 1],
        [7, 20]
      );
    },
    () => {
      // חדר ניסויים — צלב
      wallH(map, 10, 1, 13);
      wallV(map, 7, 1, 20);
      door(map, 3, 10);
      door(map, 11, 10);
      door(map, 7, 5);
      door(map, 7, 15);
      wallH(map, 5, 1, 5);
      wallH(map, 5, 9, 13);
      wallH(map, 15, 1, 5);
      wallH(map, 15, 9, 13);
      door(map, 2, 5);
      door(map, 12, 5);
      door(map, 2, 15);
      door(map, 12, 15);
      placeActors(
        map,
        [1, 1],
        [[3, 3], [11, 3], [3, 12], [11, 12], [3, 18], [11, 18]],
        [13, 10],
        [7, 20]
      );
    },
    () => {
      // מחסן כפפות — תאים צפופים
      for (let x = 3; x <= 11; x += 2) {
        wallV(map, x, 2, 19);
        door(map, x, 4 + ((x * 3) % 7));
        door(map, x, 16 - ((x * 2) % 5));
      }
      placeActors(
        map,
        [1, 2],
        [[2, 8], [4, 12], [6, 5], [8, 14], [10, 7], [12, 16]],
        [13, 10],
        [1, 20]
      );
    },
    () => {
      // לפני המעבדה הראשית
      wallH(map, 7, 1, 13);
      wallH(map, 13, 1, 13);
      door(map, 7, 7);
      door(map, 2, 13);
      door(map, 12, 13);
      for (let x of [3, 7, 11]) {
        wallV(map, x, 8, 12);
        door(map, x, 10);
      }
      // Open the cell under the top doorway so the center pillar doesn't block entry
      door(map, 7, 8);
      placeActors(
        map,
        [1, 2],
        [[5, 4], [12, 4], [5, 10], [9, 10], [4, 16], [10, 17]],
        [13, 16],
        [7, 20]
      );
    },
    () => {
      // בוס כימיה — מעבדה עם עמודים
      for (const [x, y] of [
        [3, 5],
        [5, 5],
        [9, 5],
        [11, 5],
        [3, 10],
        [11, 10],
        [3, 15],
        [5, 15],
        [9, 15],
        [11, 15],
      ]) {
        put(map, x, y, TILE.WALL);
      }
      wallH(map, 8, 1, 4);
      wallH(map, 8, 10, 13);
      door(map, 2, 8);
      door(map, 12, 8);
      placeActors(
        map,
        [7, 20],
        [[1, 6], [13, 6], [1, 14], [13, 14]],
        [[2, 2], [12, 2], [7, 12]],
        [7, 1],
        [7, 3]
      );
    },
  ];
}

/** World 5 — ענן: איים ומעברים מתפתלים */
function layoutsWorldCloud(map) {
  return [
    () => {
      wallH(map, 8, 1, 8);
      door(map, 9, 8);
      wallV(map, 9, 8, 16);
      door(map, 9, 17);
      placeActors(map, [2, 2], [[12, 4], [4, 14]], [12, 18], [2, 20]);
    },
    () => {
      // גשר ערפל — שני איים
      for (let y = 1; y <= 8; y++) {
        for (let x = 5; x <= 9; x++) if (x !== 7) put(map, x, y, TILE.WALL);
      }
      for (let y = 13; y <= 20; y++) {
        for (let x = 5; x <= 9; x++) if (x !== 7) put(map, x, y, TILE.WALL);
      }
      wallH(map, 10, 1, 5);
      wallH(map, 11, 9, 13);
      door(map, 3, 10);
      door(map, 11, 11);
      placeActors(map, [1, 2], [[3, 5], [11, 5], [3, 16], [11, 16]], [7, 10], [13, 20]);
    },
    () => {
      // ארמון ברקים — יהלום
      for (let i = 0; i < 5; i++) {
        put(map, 7 - i, 4 + i, TILE.WALL);
        put(map, 7 + i, 4 + i, TILE.WALL);
        put(map, 7 - i, 16 - i, TILE.WALL);
        put(map, 7 + i, 16 - i, TILE.WALL);
      }
      door(map, 7, 8);
      door(map, 7, 12);
      door(map, 3, 10);
      door(map, 11, 10);
      placeActors(
        map,
        [1, 1],
        [[2, 6], [12, 6], [2, 14], [12, 14], [7, 10]],
        [13, 1],
        [7, 20]
      );
    },
    () => {
      // מסדרון גשם — עמודים מפוזרים
      for (const [x, y] of [
        [2, 4],
        [4, 6],
        [6, 3],
        [8, 7],
        [10, 4],
        [12, 6],
        [3, 11],
        [5, 14],
        [7, 11],
        [9, 15],
        [11, 12],
        [4, 18],
        [10, 18],
      ]) {
        put(map, x, y, TILE.WALL);
      }
      wallH(map, 9, 1, 6);
      door(map, 4, 9);
      wallH(map, 9, 8, 13);
      door(map, 10, 9);
      placeActors(
        map,
        [1, 1],
        [[6, 5], [12, 8], [2, 13], [8, 16], [13, 14]],
        [13, 2],
        [7, 20]
      );
    },
    () => {
      // חדר סערה — מערבולת
      wallV(map, 3, 2, 10);
      wallH(map, 10, 3, 11);
      wallV(map, 11, 10, 18);
      wallH(map, 18, 3, 11);
      wallV(map, 5, 5, 15);
      wallH(map, 5, 5, 9);
      wallH(map, 15, 5, 9);
      door(map, 3, 6);
      door(map, 7, 10);
      door(map, 11, 14);
      door(map, 7, 18);
      door(map, 5, 8);
      door(map, 5, 12);
      placeActors(
        map,
        [1, 2],
        [[7, 3], [12, 7], [2, 12], [9, 16], [4, 19]],
        [13, 2],
        [13, 20]
      );
    },
    () => {
      // כלוב — מסגרות מקוננות
      wallH(map, 4, 2, 12);
      wallH(map, 17, 2, 12);
      wallV(map, 2, 4, 17);
      wallV(map, 12, 4, 17);
      door(map, 7, 4);
      door(map, 7, 17);
      wallH(map, 8, 4, 10);
      wallH(map, 13, 4, 10);
      wallV(map, 4, 8, 13);
      wallV(map, 10, 8, 13);
      door(map, 7, 8);
      door(map, 7, 13);
      door(map, 4, 10);
      door(map, 10, 10);
      placeActors(
        map,
        [1, 1],
        [[3, 6], [11, 6], [6, 10], [3, 15], [11, 15]],
        [7, 10],
        [13, 20]
      );
    },
    () => {
      // מנהרת עננים — גלים
      for (let y = 3; y <= 18; y += 3) {
        const left = y % 6 === 3;
        wallH(map, y, left ? 1 : 4, left ? 10 : 13);
        door(map, left ? 11 : 2, y);
      }
      placeActors(
        map,
        [1, 1],
        [[5, 5], [11, 5], [3, 11], [12, 11], [6, 17], [10, 17]],
        [13, 1],
        [7, 20]
      );
    },
    () => {
      // מרפסת רוח — פתוח עם מחסומי צד
      wallV(map, 2, 2, 19);
      wallV(map, 12, 2, 19);
      for (let y of [5, 9, 13, 17]) {
        door(map, 2, y);
        door(map, 12, y + 1);
        wallH(map, y, 4, 6);
        wallH(map, y + 1, 8, 10);
      }
      placeActors(
        map,
        [7, 1],
        [[4, 3], [10, 4], [5, 10], [9, 11], [4, 16], [10, 18]],
        [7, 12],
        [7, 20]
      );
    },
    () => {
      // לפני הליבה
      wallH(map, 6, 1, 13);
      wallH(map, 12, 1, 13);
      door(map, 2, 6);
      door(map, 12, 6);
      door(map, 7, 12);
      for (let x of [4, 7, 10]) {
        wallV(map, x, 7, 11);
        door(map, x, 9);
      }
      // Open cells above the bottom doorway so the center pillar doesn't block it
      door(map, 7, 10);
      door(map, 7, 11);
      wallV(map, 5, 13, 19);
      wallV(map, 9, 13, 19);
      door(map, 5, 16);
      door(map, 9, 15);
      placeActors(
        map,
        [1, 2],
        [[6, 3], [11, 4], [2, 9], [12, 9], [3, 15], [11, 17]],
        [13, 14],
        [7, 20]
      );
    },
    () => {
      // לב הענן — מסלול צר
      for (let x = 3; x <= 11; x += 2) {
        wallV(map, x, 2, 19);
        door(map, x, 5 + ((x * 5) % 8));
        door(map, x, 14 - ((x * 3) % 6));
      }
      placeActors(
        map,
        [1, 10],
        [[2, 4], [4, 8], [6, 3], [8, 12], [10, 6], [12, 15], [6, 18]],
        [13, 10],
        [1, 20]
      );
    },
    () => {
      // בוס ענן — זירה פתוחה עם ענני עמודים
      for (const [x, y] of [
        [3, 6],
        [11, 6],
        [5, 9],
        [9, 9],
        [3, 12],
        [11, 12],
        [5, 15],
        [9, 15],
      ]) {
        put(map, x, y, TILE.WALL);
        put(map, x + 1, y, TILE.WALL);
      }
      wallH(map, 4, 5, 9);
      door(map, 7, 4);
      wallH(map, 18, 5, 9);
      door(map, 7, 18);
      placeActors(
        map,
        [7, 20],
        [[1, 8], [13, 8], [1, 14], [13, 14]],
        [[2, 2], [12, 2], [7, 11]],
        [7, 1],
        [7, 3]
      );
    },
  ];
}

const WORLD_LAYOUT_BUILDERS = [
  layoutsWorldSchool,
  layoutsWorldMusic,
  layoutsWorldSports,
  layoutsWorldChem,
  layoutsWorldCloud,
];

function makeLevel(index, worldIndex = 0) {
  const w = 15;
  const h = 22;
  const map = buildRect(w, h, TILE.EMPTY);
  stampBorder(map);

  const wIdx = Math.max(0, Math.min(worldIndex, WORLD_LAYOUT_BUILDERS.length - 1));
  const layouts = WORLD_LAYOUT_BUILDERS[wIdx](map);
  const li = Math.max(0, Math.min(index, layouts.length - 1));
  layouts[li]();

  return {
    index: li,
    ...localizeMeta(LEVEL_META[li]),
    map,
    width: w,
    height: h,
    zombieSpeed: Math.min(1.35, 0.7 + li * 0.07),
    playerSpeed: 2.35,
    keysNeeded: li === 10 ? 3 : 1,
    isBoss: li === 10,
    themeId: LEVEL_META[li].theme,
    theme: THEMES[LEVEL_META[li].theme],
  };
}

const LEVELS_PER_WORLD = 11; // 10 stages + boss

const WORLDS = [
  {
    id: "school",
    name: "World 1 · School",
    bossType: "principal",
    bossTitle: "Zombie Principal",
  },
  {
    id: "music",
    name: "World 2 · Music Wing",
    bossType: "music",
    bossTitle: "Music Teacher",
  },
  {
    id: "sports",
    name: "World 3 · Sports Hall",
    bossType: "sports",
    bossTitle: "PE Teacher",
  },
  {
    id: "chem",
    name: "World 4 · Chemistry Lab",
    bossType: "chem",
    bossTitle: "Chemistry Teacher",
  },
  {
    id: "cloud",
    name: "World 5 · Cloud Kingdom",
    bossType: "cloud",
    bossTitle: "Cloud Monster",
  },
];

const WORLD_LEVEL_METAS = [
  LEVEL_META,
  [
  {
    nameHe: "מסדרון התווים",
    descHe: "החברים נעלמו. התחל לחפש!",
    nameEn: "Note Corridor",
    descEn: "Friends are gone. Start searching!",
    theme: "music",
  },
  {
    nameHe: "חדר חזרות",
    descHe: "המוזיקה משגעת את הזומבים.",
    nameEn: "Rehearsal Room",
    descEn: "The music drives the zombies wild.",
    theme: "piano",
  },
  {
    nameHe: "אולם קונצרטים",
    descHe: "רעש גדול — תיזהר!",
    nameEn: "Concert Hall",
    descEn: "Loud noise — watch out!",
    theme: "concert",
  },
  {
    nameHe: "מחסן כלים",
    descHe: "כינורות וזומבים בכל פינה.",
    nameEn: "Instrument Storage",
    descEn: "Violins and zombies everywhere.",
    theme: "storage",
  },
  {
    nameHe: "חדר פסנתרים",
    descHe: "ספרים יעזרו לך לעצור אותם.",
    nameEn: "Piano Room",
    descEn: "Books will help you stop them.",
    theme: "piano",
  },
  {
    nameHe: "סטודיו הקלטות",
    descHe: "הקירות רועדים מהבס.",
    nameEn: "Recording Studio",
    descEn: "The walls shake from the bass.",
    theme: "studio",
  },
  {
    nameHe: "מסדרון אקוסטי",
    descHe: "הד חוזר — והזומבים גם.",
    nameEn: "Acoustic Hallway",
    descEn: "Echoes return — and so do zombies.",
    theme: "music",
  },
  {
    nameHe: "חדר מקהלה",
    descHe: "הם שרים... לא יפה.",
    nameEn: "Choir Room",
    descEn: "They're singing… badly.",
    theme: "concert",
  },
  {
    nameHe: "גג האגף",
    descHe: "כמעט אצל הבוס.",
    nameEn: "Wing Roof",
    descEn: "Almost at the boss.",
    theme: "yard",
  },
  {
    nameHe: "לפני הבמה",
    descHe: "המורה מחכה מאחורי הווילון.",
    nameEn: "Before the Stage",
    descEn: "The teacher waits behind the curtain.",
    theme: "concert",
  },
  {
    nameHe: "מורה למוזיקה",
    descHe: "בוס! היא זורקת תווים מוזיקליים — התחמקו וברחו!",
    nameEn: "Music Teacher",
    descEn: "Boss! She throws musical notes — dodge and escape!",
    theme: "music",
  },
  ],
  [
  {
    nameHe: "מסדרון המלתחות",
    descHe: "ריח של גומי וזומבים.",
    nameEn: "Locker Hallway",
    descEn: "Smells like rubber and zombies.",
    theme: "locker",
  },
  {
    nameHe: "מגרש כדורסל",
    descHe: "כדורים מתגלגלים — והמורים רצים!",
    nameEn: "Basketball Court",
    descEn: "Balls rolling — and teachers running!",
    theme: "basketball",
  },
  {
    nameHe: "חדר כושר",
    descHe: "משקולות בכל פינה.",
    nameEn: "Weight Room",
    descEn: "Weights in every corner.",
    theme: "gym",
  },
  {
    nameHe: "מסלול ריצה",
    descHe: "תרוץ מהר יותר מהזומבים!",
    nameEn: "Running Track",
    descEn: "Run faster than the zombies!",
    theme: "track",
  },
  {
    nameHe: "בריכת שחייה",
    descHe: "רצפה חלקה — זהירות.",
    nameEn: "Swimming Pool",
    descEn: "Slippery floor — careful.",
    theme: "pool",
  },
  {
    nameHe: "חדר מדידות",
    descHe: "ספרים יקפיאו את הרודפים.",
    nameEn: "Measure Room",
    descEn: "Books will freeze the chasers.",
    theme: "classroom",
  },
  {
    nameHe: "מחסן ציוד",
    descHe: "כדורים, מחבטים וזומבים.",
    nameEn: "Equipment Shed",
    descEn: "Balls, bats, and zombies.",
    theme: "storage",
  },
  {
    nameHe: "יציע האוהדים",
    descHe: "הם צועקים… לא בעדך.",
    nameEn: "Fan Stands",
    descEn: "They're cheering… not for you.",
    theme: "bleachers",
  },
  {
    nameHe: "מנהרת השחקנים",
    descHe: "כמעט אצל המורה.",
    nameEn: "Player Tunnel",
    descEn: "Almost at the teacher.",
    theme: "locker",
  },
  {
    nameHe: "לפני המגרש",
    descHe: "שריקת הפתיחה קרובה.",
    nameEn: "Before the Field",
    descEn: "Kickoff whistle is close.",
    theme: "basketball",
  },
  {
    nameHe: "מורה לספורט",
    descHe: "בוס! זורק כדורים מהירים — התחמקו וברחו!",
    nameEn: "PE Teacher",
    descEn: "Boss! Throws fast balls — dodge and escape!",
    theme: "basketball",
  },
  ],
  [
  {
    nameHe: "מסדרון החומצות",
    descHe: "שלטים צהובים בכל מקום.",
    nameEn: "Acid Corridor",
    descEn: "Yellow warning signs everywhere.",
    theme: "chemistry",
  },
  {
    nameHe: "מעבדה א׳",
    descHe: "מבחנות שוברות… והזומבים לא.",
    nameEn: "Lab A",
    descEn: "Glass breaks… zombies don't.",
    theme: "chemistry",
  },
  {
    nameHe: "מחסן כימיקלים",
    descHe: "אל תיגע בבקבוקים!",
    nameEn: "Chemical Storage",
    descEn: "Don't touch the bottles!",
    theme: "storage",
  },
  {
    nameHe: "חדר כור היתוך",
    descHe: "חם מדי פה.",
    nameEn: "Reactor Room",
    descEn: "Way too hot in here.",
    theme: "reactor",
  },
  {
    nameHe: "איי המבחנות",
    descHe: "בלוקים ירוקים חוסמים — תעקפו אותם.",
    nameEn: "Beaker Isles",
    descEn: "Green blocks in the way — go around.",
    theme: "chemistry",
  },
  {
    nameHe: "חדר בטיחות",
    descHe: "המשקפיים לא יעזרו נגד זומבים.",
    nameEn: "Safety Room",
    descEn: "Goggles won't help against zombies.",
    theme: "locker",
  },
  {
    nameHe: "מסדרון האדים",
    descHe: "ראות נמוכה — היזהרו!",
    nameEn: "Vapor Hallway",
    descEn: "Low visibility — be careful!",
    theme: "fog",
  },
  {
    nameHe: "חדר ניסויים",
    descHe: "ספרים יעצרו את הרדיפה.",
    nameEn: "Experiment Room",
    descEn: "Books will stop the chase.",
    theme: "chemistry",
  },
  {
    nameHe: "מחסן כפפות",
    descHe: "כמעט אצל הבוס.",
    nameEn: "Glove Storage",
    descEn: "Almost at the boss.",
    theme: "storage",
  },
  {
    nameHe: "לפני המעבדה הראשית",
    descHe: "משהו מבעבע מאחורי הדלת.",
    nameEn: "Before the Main Lab",
    descEn: "Something is bubbling behind the door.",
    theme: "chemistry",
  },
  {
    nameHe: "מורה לכימיה",
    descHe: "בוס! זורקת שיקויים ירוקים שמאטים — התחמקו וברחו!",
    nameEn: "Chemistry Teacher",
    descEn: "Boss! Throws green potions that slow you — dodge and escape!",
    theme: "reactor",
  },
  ],
  [
  {
    nameHe: "שער העננים",
    descHe: "הרוח חזקה. החברים קרובים.",
    nameEn: "Cloud Gate",
    descEn: "Strong wind. Friends are close.",
    theme: "cloud",
  },
  {
    nameHe: "גשר הערפל",
    descHe: "אל תיפלו מהענן!",
    nameEn: "Fog Bridge",
    descEn: "Don't fall off the cloud!",
    theme: "fog",
  },
  {
    nameHe: "ארמון הברקים",
    descHe: "הבזקים בכל שנייה.",
    nameEn: "Lightning Palace",
    descEn: "Flashes every second.",
    theme: "storm",
  },
  {
    nameHe: "מסדרון הגשם",
    descHe: "טיפות כבדות — וזומבים רטובים.",
    nameEn: "Rain Corridor",
    descEn: "Heavy drops — and wet zombies.",
    theme: "fog",
  },
  {
    nameHe: "חדר הסערה",
    descHe: "הרוח דוחפת את כולם.",
    nameEn: "Storm Room",
    descEn: "The wind pushes everyone.",
    theme: "storm",
  },
  {
    nameHe: "כלוב החברים",
    descHe: "שומעים קריאות לעזרה!",
    nameEn: "Friends' Cage",
    descEn: "You hear cries for help!",
    theme: "cage",
  },
  {
    nameHe: "מנהרת עננים",
    descHe: "כמעט שם.",
    nameEn: "Cloud Tunnel",
    descEn: "Almost there.",
    theme: "cloud",
  },
  {
    nameHe: "מרפסת הרוח",
    descHe: "הענן צוחק מלמעלה.",
    nameEn: "Wind Balcony",
    descEn: "The cloud laughs from above.",
    theme: "cloud",
  },
  {
    nameHe: "לפני הליבה",
    descHe: "עוד רגע — העימות האחרון.",
    nameEn: "Before the Core",
    descEn: "One moment — the final fight.",
    theme: "storm",
  },
  {
    nameHe: "לב הענן",
    descHe: "אין דרך חזרה.",
    nameEn: "Cloud Heart",
    descEn: "No way back.",
    theme: "cloud",
  },
  {
    nameHe: "ענן־המפלצת",
    descHe: "הבוס הסופי! זורק ברקים וגשם — הצילו את החברים!",
    nameEn: "Cloud Monster",
    descEn: "Final boss! Throws lightning and rain — save your friends!",
    theme: "storm",
  },
  ],
];

function campaignMeta(worldIndex, levelInWorld) {
  const list = WORLD_LEVEL_METAS[worldIndex] || LEVEL_META;
  return localizeMeta(list[levelInWorld] || LEVEL_META[levelInWorld]);
}

function makeCampaignLevel(worldIndex, levelInWorld) {
  const wIdx = Math.max(0, Math.min(worldIndex, WORLDS.length - 1));
  const li = Math.max(0, Math.min(levelInWorld, LEVELS_PER_WORLD - 1));
  const world = WORLDS[wIdx];
  const base = makeLevel(li, wIdx);
  const meta = campaignMeta(wIdx, li);
  const isBoss = li === LEVELS_PER_WORLD - 1;
  return {
    ...base,
    ...meta,
    index: li,
    worldIndex: wIdx,
    levelInWorld: li,
    isBoss,
    bossType: isBoss ? world.bossType : null,
    worldName:
      typeof I18n !== "undefined" && I18n.worldName
        ? I18n.worldName(wIdx)
        : world.name,
    keysNeeded: isBoss ? 3 : 1,
    themeId: meta.theme,
    theme: THEMES[meta.theme] || base.theme,
    zombieSpeed: Math.min(1.65, base.zombieSpeed + wIdx * 0.1),
    playerSpeed: base.playerSpeed,
  };
}
const VERSUS_META = [
  {
    nameHe: "מסדרון המירוץ",
    descHe: "שני מסלולים מקבילים. מי שמגיע ראשון לדלת מנצח!",
    nameEn: "Race Corridor",
    descEn: "Two parallel lanes. First to the door wins!",
    theme: "corridor",
  },
  {
    nameHe: "המראה הכפולה",
    descHe: "מפה סימטרית — כל אחד מתחיל בצד שלו.",
    nameEn: "Mirror Match",
    descEn: "Symmetric map — each starts on their side.",
    theme: "lobby",
  },
  {
    nameHe: "זירת האולם",
    descHe: "זירה פתוחה. חפשי חבלה בכל פינה!",
    nameEn: "Hall Arena",
    descEn: "Open arena. Grab sabotage items!",
    theme: "gym",
  },
  {
    nameHe: "מבוך הדו־קרב",
    descHe: "מבוך צפוף. אל תיתן ליריב להקדים אותך.",
    nameEn: "Duel Maze",
    descEn: "Dense maze. Don't let your rival beat you.",
    theme: "classroom",
  },
  {
    nameHe: "מעבדת הכימיה",
    descHe: "מסלולים מתפצלים. זרוק 🍌 וברח!",
    nameEn: "Chemistry Lab",
    descEn: "Split paths. Throw 🍌 and run!",
    theme: "chemistry",
  },
  {
    nameHe: "ספריית הצללים",
    descHe: "מדפים חוסמים. מי ששורד / מגיע ראשון — מנצח.",
    nameEn: "Shadow Library",
    descEn: "Shelves block the way. Survive or reach first — win.",
    theme: "library",
  },
  {
    nameHe: "גמר האליפות",
    descHe: "הסיבוב האחרון! הכל או כלום.",
    nameEn: "Championship Final",
    descEn: "Last round! All or nothing.",
    theme: "office",
  },
];

const VERSUS_LEVEL_COUNT = VERSUS_META.length;

function makeVersusLevel(index) {
  const w = 15;
  const h = 22;
  const map = buildRect(w, h, TILE.EMPTY);
  stampBorder(map);

  const layouts = [
    // 1 — parallel race lanes
    () => {
      wallV(map, 7, 1, 18);
      door(map, 7, 10);
      door(map, 7, 16);
      put(map, 3, 20, TILE.SPAWN);
      put(map, 11, 20, TILE.SPAWN2);
      put(map, 3, 4, TILE.KEY);
      put(map, 11, 4, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      put(map, 3, 12, TILE.ZOMBIE);
      put(map, 11, 12, TILE.ZOMBIE);
      put(map, 5, 8, TILE.ZOMBIE);
      put(map, 9, 8, TILE.ZOMBIE);
    },
    // 2 — mirrored halves
    () => {
      wallV(map, 7, 3, 18);
      for (let y = 5; y <= 17; y += 4) {
        wallH(map, y, 1, 5);
        wallH(map, y, 9, 13);
        door(map, 3, y);
        door(map, 11, y);
      }
      door(map, 7, 8);
      door(map, 7, 14);
      put(map, 2, 20, TILE.SPAWN);
      put(map, 12, 20, TILE.SPAWN2);
      put(map, 2, 2, TILE.KEY);
      put(map, 12, 2, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      put(map, 4, 10, TILE.ZOMBIE);
      put(map, 10, 10, TILE.ZOMBIE);
      put(map, 2, 14, TILE.ZOMBIE);
      put(map, 12, 14, TILE.ZOMBIE);
    },
    // 3 — open arena
    () => {
      wallH(map, 6, 3, 5);
      wallH(map, 6, 9, 11);
      wallH(map, 14, 3, 5);
      wallH(map, 14, 9, 11);
      wallV(map, 4, 9, 11);
      wallV(map, 10, 9, 11);
      put(map, 2, 20, TILE.SPAWN);
      put(map, 12, 20, TILE.SPAWN2);
      put(map, 7, 11, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      for (const [x, y] of [
        [4, 4],
        [10, 4],
        [2, 10],
        [12, 10],
        [7, 16],
        [4, 18],
        [10, 18],
      ]) {
        put(map, x, y, TILE.ZOMBIE);
      }
    },
    // 4 — competitive maze
    () => {
      for (let x = 3; x <= 11; x += 2) {
        wallV(map, x, 2, 19);
        door(map, x, 5 + ((x * 3) % 10));
        door(map, x, 15 - ((x * 2) % 8));
      }
      put(map, 1, 20, TILE.SPAWN);
      put(map, 13, 20, TILE.SPAWN2);
      put(map, 7, 2, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      for (const [x, y] of [
        [2, 8],
        [4, 12],
        [6, 6],
        [8, 14],
        [10, 8],
        [12, 12],
        [7, 18],
      ]) {
        put(map, x, y, TILE.ZOMBIE);
      }
    },
    // 5 — split chemistry lanes
    () => {
      wallH(map, 5, 1, 13);
      door(map, 3, 5);
      door(map, 7, 5);
      door(map, 11, 5);
      wallH(map, 11, 1, 13);
      door(map, 2, 11);
      door(map, 7, 11);
      door(map, 12, 11);
      wallH(map, 16, 1, 13);
      door(map, 4, 16);
      door(map, 10, 16);
      wallV(map, 7, 6, 15);
      door(map, 7, 8);
      door(map, 7, 13);
      put(map, 2, 20, TILE.SPAWN);
      put(map, 12, 20, TILE.SPAWN2);
      put(map, 7, 2, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      for (const [x, y] of [
        [3, 8],
        [11, 8],
        [2, 13],
        [12, 13],
        [5, 18],
        [9, 18],
      ]) {
        put(map, x, y, TILE.ZOMBIE);
      }
    },
    // 6 — library shelves duel
    () => {
      for (let y = 3; y < 19; y += 3) {
        wallH(map, y, 1, 5);
        door(map, 3, y);
        wallH(map, y + 1, 9, 13);
        door(map, 11, y + 1);
      }
      wallV(map, 7, 2, 19);
      door(map, 7, 6);
      door(map, 7, 12);
      door(map, 7, 17);
      put(map, 1, 20, TILE.SPAWN);
      put(map, 13, 20, TILE.SPAWN2);
      put(map, 7, 3, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      for (const [x, y] of [
        [3, 5],
        [11, 4],
        [2, 10],
        [12, 11],
        [4, 15],
        [10, 16],
        [5, 19],
        [9, 19],
      ]) {
        put(map, x, y, TILE.ZOMBIE);
      }
    },
    // 7 — championship finale
    () => {
      wallV(map, 4, 2, 18);
      wallV(map, 10, 2, 18);
      for (let y = 4; y <= 16; y += 4) {
        door(map, 4, y);
        door(map, 10, y);
      }
      wallH(map, 10, 5, 9);
      door(map, 7, 10);
      put(map, 2, 20, TILE.SPAWN);
      put(map, 12, 20, TILE.SPAWN2);
      put(map, 7, 14, TILE.KEY);
      put(map, 2, 3, TILE.KEY);
      put(map, 12, 3, TILE.KEY);
      put(map, 7, 1, TILE.EXIT);
      for (const [x, y] of [
        [2, 8],
        [12, 8],
        [6, 6],
        [8, 6],
        [2, 15],
        [12, 15],
        [7, 18],
        [5, 12],
        [9, 12],
      ]) {
        put(map, x, y, TILE.ZOMBIE);
      }
    },
  ];

  const i = Math.max(0, Math.min(index, layouts.length - 1));
  layouts[i]();

  return {
    index: i,
    ...localizeMeta(VERSUS_META[i]),
    map,
    width: w,
    height: h,
    zombieSpeed: Math.min(1.25, 0.75 + i * 0.07),
    playerSpeed: 2.45,
    keysNeeded: i === VERSUS_LEVEL_COUNT - 1 ? 2 : 1,
    isBoss: false,
    isVersus: true,
    themeId: VERSUS_META[i].theme,
    theme: THEMES[VERSUS_META[i].theme],
  };
}

