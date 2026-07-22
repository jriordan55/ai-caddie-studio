/**
 * AI Caddie Studio — profile stored in localStorage.
 * Each browser gets its own bag + courses. Export/import for backup.
 */
(function (global) {
  const KEY = "ai_caddie_studio_v1";

  const DEFAULT_PGA = {
    Driver: { carry: 275, total: 296, cs: 113, bs: 167, smash: 1.48, spin: 2686, apex: 103 },
    "3W": { carry: 243, total: 262, cs: 107, bs: 158, smash: 1.48, spin: 3655, apex: 95 },
    Hybrid: { carry: 225, total: 242, cs: 100, bs: 146, smash: 1.46, spin: 4500, apex: 92 },
    "5i": { carry: 194, total: 209, cs: 94, bs: 132, smash: 1.41, spin: 5361, apex: 98 },
    "6i": { carry: 183, total: 197, cs: 92, bs: 127, smash: 1.38, spin: 6231, apex: 96 },
    "7i": { carry: 172, total: 185, cs: 90, bs: 120, smash: 1.33, spin: 7097, apex: 97 },
    "8i": { carry: 160, total: 172, cs: 87, bs: 115, smash: 1.32, spin: 7998, apex: 100 },
    "9i": { carry: 148, total: 159, cs: 85, bs: 109, smash: 1.28, spin: 8647, apex: 102 },
    PW: { carry: 136, total: 146, cs: 83, bs: 102, smash: 1.23, spin: 9304, apex: 98 },
    AW: { carry: 125, total: 131, cs: 81, bs: 98, smash: 1.21, spin: 9500, apex: 94 },
    GW: { carry: 125, total: 131, cs: 81, bs: 98, smash: 1.21, spin: 9500, apex: 94 },
    SW: { carry: 92, total: 97, cs: 76, bs: 85, smash: 1.12, spin: 10000, apex: 88 },
    LW: { carry: 90, total: 95, cs: 78, bs: 88, smash: 1.13, spin: 9300, apex: 85 },
    "60": { carry: 74, total: 78, cs: 72, bs: 78, smash: 1.08, spin: 9300, apex: 82 },
  };

  const DEFAULT_SCRATCH = {
    Driver: 250, "3W": 225, Hybrid: 210, "5i": 180, "6i": 170, "7i": 160,
    "8i": 148, "9i": 138, PW: 125, AW: 112, GW: 112, SW: 90, LW: 105, "60": 75,
  };
  const DEFAULT_AM10 = {
    Driver: 220, "3W": 195, Hybrid: 185, "5i": 160, "6i": 150, "7i": 145,
    "8i": 135, "9i": 125, PW: 115, AW: 100, GW: 100, SW: 85, LW: 100, "60": 70,
  };

  function emptyProfile() {
    return {
      name: "",
      updatedAt: null,
      bag: null,      // GOLF_DATA shape
      courses: [],    // GPS_COURSES shape
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptyProfile();
      return { ...emptyProfile(), ...JSON.parse(raw) };
    } catch {
      return emptyProfile();
    }
  }

  function save(profile) {
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(profile));
    return profile;
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  function hasBag(p) {
    return !!(p?.bag?.clubs?.length);
  }

  function missFromAxis(axis) {
    if (axis <= -2) return "Left / draw";
    if (axis >= 2) return "Right / fade";
    return "Neutral";
  }

  function consistencyFrom(stdev, carry) {
    if (!carry) return 0;
    return Math.max(0, Math.min(100, Math.round(100 - (stdev / carry) * 400)));
  }

  function optNum(v) {
    if (v === "" || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  /**
   * Build one club from averages. Carry is required; everything else is optional.
   * Missing fields are estimated so Play still works; CSV import is more accurate.
   */
  function clubFromSimple(row) {
    const id = String(row.id || "").trim();
    const carry = optNum(row.carry) ?? 0;
    if (!id || !(carry > 0)) throw new Error("Each club needs a name and average carry.");
    const pga = DEFAULT_PGA[id] || {
      carry: Math.round(carry * 1.1),
      total: Math.round(carry * 1.16),
      cs: 90, bs: 120, smash: 1.3, spin: 5000, apex: 90,
    };
    const total = optNum(row.total) ?? Math.round(carry * 1.06);
    const stock = optNum(row.stock) ?? carry;
    const stdev = optNum(row.stdev) ?? Math.max(3, Math.round(carry * 0.04));
    const axis = optNum(row.axis) ?? 0;
    const scale = pga.carry ? carry / pga.carry : 1;
    const ballSpeed = optNum(row.ballSpeed) ?? Math.round((pga.bs || carry * 0.62) * scale);
    const clubSpeed = optNum(row.clubSpeed) ?? Math.round((pga.cs || carry * 0.45) * scale);
    const smash = optNum(row.smash) ?? (pga.smash || (ballSpeed && clubSpeed ? Math.round((ballSpeed / clubSpeed) * 100) / 100 : 1.3));
    const apex = optNum(row.apex) ?? (pga.apex || 90);
    const spin = optNum(row.spin) ?? (pga.spin || 5000);
    const scratch = DEFAULT_SCRATCH[id] ?? Math.round(carry * 0.95);
    const am10 = DEFAULT_AM10[id] ?? Math.round(carry * 0.85);
    const out = {
      id,
      name: row.name || id,
      shots: optNum(row.shots) ?? 0,
      carry,
      stock,
      total,
      min: optNum(row.min) ?? Math.round(carry - stdev * 2),
      max: optNum(row.max) ?? Math.round(carry + stdev * 2),
      stdev,
      consistency: consistencyFrom(stdev, carry),
      ballSpeed,
      clubSpeed,
      smash,
      apex,
      spin,
      axis,
      offline: optNum(row.offline) ?? Math.round(axis * (carry / 100) * 0.45 * 10) / 10,
      spread: optNum(row.spread) ?? Math.round(stdev * 1.2),
      miss: row.miss || missFromAxis(axis),
      pga,
      am10,
      scratch,
      vsPga: Math.round((carry - pga.carry) * 10) / 10,
      vsAm10: Math.round((carry - am10) * 10) / 10,
      vsScratch: Math.round((carry - scratch) * 10) / 10,
      shotList: row.shotList || [],
      estimated: !(row.smash || row.spin || row.apex || row.ballSpeed || row.clubSpeed),
    };
    for (const k of [
      "launch", "descent", "horiz", "face", "path", "faceToPath", "sideCarry", "sideTotal",
    ]) {
      const v = optNum(row[k]);
      if (v != null) out[k] = v;
    }
    return out;
  }

  function bagFromClubs(clubs, label) {
    const sorted = [...clubs].sort((a, b) => b.stock - a.stock);
    const gaps = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      gaps.push({
        from: sorted[i].id,
        to: sorted[i + 1].id,
        gap: Math.round((sorted[i].stock - sorted[i + 1].stock) * 10) / 10,
      });
    }
    return {
      session: {
        shots: sorted.reduce((s, c) => s + (c.shots || c.shotList?.length || 0), 0),
        clubs: sorted.length,
        perClub: 0,
        label: label || "My bag",
      },
      clubs: sorted,
      gaps,
    };
  }

  /** Parse launch-monitor style CSV (Shot,Club,Carry,...). */
  function bagFromCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV needs a header and at least one shot.");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idx = (names) => {
      for (const n of names) {
        const i = header.indexOf(n);
        if (i >= 0) return i;
      }
      return -1;
    };
    const iShot = idx(["shot"]);
    const iClub = idx(["club"]);
    const iCarry = idx(["carry_yards", "carry"]);
    const iTotal = idx(["total_yards", "total"]);
    const iBs = idx(["ball_speed_mph", "ball_speed"]);
    const iCs = idx(["club_speed_mph", "club_speed"]);
    const iSmash = idx(["smash_factor", "smash"]);
    const iApex = idx(["apex_feet", "apex"]);
    const iSpin = idx(["spin_rate_rpm", "spin"]);
    const iAxis = idx(["spin_axis_deg", "spin_axis"]);
    const iLaunch = idx(["launch_angle_deg", "launch_angle", "launch"]);
    const iDescent = idx(["descent_angle_deg", "descent_angle", "descent"]);
    const iHoriz = idx(["horiz_angle_deg", "horiz_angle", "horiz"]);
    const iFace = idx(["face_angle_deg", "face_angle", "face"]);
    const iPath = idx(["club_path_deg", "club_path", "path"]);
    const iFtp = idx(["face_to_path_deg", "face_to_path"]);
    const iSideC = idx(["side_carry_yards", "side_carry"]);
    const iSideT = idx(["side_total_yards", "side_total", "offline_yards"]);
    if (iClub < 0 || iCarry < 0) throw new Error("CSV must include Club and Carry columns.");

    const parseSigned = (raw) => {
      if (raw == null || raw === "") return undefined;
      const s = String(raw).trim();
      if (!s) return undefined;
      const n = parseFloat(s);
      if (!Number.isFinite(n)) return undefined;
      if (/l$/i.test(s)) return -Math.abs(n);
      if (/r$/i.test(s)) return Math.abs(n);
      return n;
    };

    const byClub = {};
    for (let r = 1; r < lines.length; r++) {
      if (!lines[r].trim()) continue;
      const p = lines[r].split(",");
      const club = p[iClub]?.trim();
      if (!club) continue;
      const carry = Number(p[iCarry]);
      if (!Number.isFinite(carry)) continue;
      const axisRaw = iAxis >= 0 ? p[iAxis] : "0";
      let axis = 0;
      if (axisRaw != null) {
        const s = String(axisRaw).trim();
        if (s.endsWith("L")) axis = -Math.abs(parseFloat(s));
        else if (s.endsWith("R")) axis = Math.abs(parseFloat(s));
        else axis = parseFloat(s) || 0;
      }
      const sideTotal = iSideT >= 0 ? parseSigned(p[iSideT]) : undefined;
      const sideCarry = iSideC >= 0 ? parseSigned(p[iSideC]) : undefined;
      const offline =
        sideTotal != null
          ? sideTotal
          : sideCarry != null
            ? sideCarry
            : Math.round(axis * (carry / 100) * 0.45 * 10) / 10;
      const shot = {
        n: iShot >= 0 ? Number(p[iShot]) || r : r,
        carry,
        total: iTotal >= 0 ? Number(p[iTotal]) || carry : carry,
        smash: iSmash >= 0 ? Number(p[iSmash]) || 1.3 : 1.3,
        spin: iSpin >= 0 ? Number(p[iSpin]) || 5000 : 5000,
        apex: iApex >= 0 ? Number(p[iApex]) || 90 : 90,
        ballSpeed: iBs >= 0 ? Number(p[iBs]) || 0 : 0,
        clubSpeed: iCs >= 0 ? Number(p[iCs]) || 0 : 0,
        axis: axis === 0 ? "0" : axis < 0 ? `${axis}L` : `${axis}R`,
        offline,
      };
      const opt = (i) => (i >= 0 ? parseSigned(p[i]) : undefined);
      const launch = opt(iLaunch);
      const descent = opt(iDescent);
      const horiz = opt(iHoriz);
      const face = opt(iFace);
      const path = opt(iPath);
      const faceToPath = opt(iFtp);
      if (launch != null) shot.launch = launch;
      if (descent != null) shot.descent = descent;
      if (horiz != null) shot.horiz = horiz;
      if (face != null) shot.face = face;
      if (path != null) shot.path = path;
      if (faceToPath != null) shot.faceToPath = faceToPath;
      if (sideCarry != null) shot.sideCarry = sideCarry;
      if (sideTotal != null) shot.sideTotal = sideTotal;
      (byClub[club] || (byClub[club] = [])).push(shot);
    }

    const clubs = Object.entries(byClub).map(([id, shots]) => {
      const carries = shots.map((s) => s.carry);
      const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      const stdev = (a) => {
        if (a.length < 2) return 0;
        const m = mean(a);
        return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
      };
      const trimmed = (() => {
        if (carries.length <= 2) return mean(carries);
        const s = [...carries].sort((a, b) => a - b);
        return mean(s.slice(1, -1));
      })();
      const axes = shots.map((s) => {
        const t = s.axis;
        if (t === "0") return 0;
        const n = parseFloat(t);
        return String(t).includes("L") ? -Math.abs(n) : Math.abs(n);
      });
      return clubFromSimple({
        id,
        name: id,
        shots: shots.length,
        carry: Math.round(mean(carries) * 10) / 10,
        stock: Math.round(trimmed * 10) / 10,
        total: Math.round(mean(shots.map((s) => s.total)) * 10) / 10,
        min: Math.min(...carries),
        max: Math.max(...carries),
        stdev: Math.round(stdev(carries) * 10) / 10,
        ballSpeed: mean(shots.map((s) => s.ballSpeed).filter(Boolean)) || undefined,
        clubSpeed: mean(shots.map((s) => s.clubSpeed).filter(Boolean)) || undefined,
        smash: Math.round(mean(shots.map((s) => s.smash)) * 100) / 100,
        apex: Math.round(mean(shots.map((s) => s.apex)) * 10) / 10,
        spin: Math.round(mean(shots.map((s) => s.spin))),
        axis: Math.round(mean(axes) * 10) / 10,
        offline: Math.round(mean(shots.map((s) => s.offline)) * 10) / 10,
        shotList: shots,
        launch: meanOpt(shots, "launch"),
        descent: meanOpt(shots, "descent"),
        horiz: meanOpt(shots, "horiz"),
        face: meanOpt(shots, "face"),
        path: meanOpt(shots, "path"),
        faceToPath: meanOpt(shots, "faceToPath"),
        sideCarry: meanOpt(shots, "sideCarry"),
        sideTotal: meanOpt(shots, "sideTotal"),
      });
    });

    return bagFromClubs(clubs, "Imported session");
  }

  function meanOpt(shots, key) {
    const vals = shots.map((s) => s[key]).filter((v) => v != null && Number.isFinite(Number(v))).map(Number);
    if (!vals.length) return undefined;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }

  function exportJson(profile) {
    return JSON.stringify(profile, null, 2);
  }

  function importJson(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("Invalid profile JSON.");
    return save({ ...emptyProfile(), ...data });
  }

  global.StudioProfile = {
    KEY,
    load,
    save,
    clear,
    hasBag,
    emptyProfile,
    clubFromSimple,
    bagFromClubs,
    bagFromCsv,
    exportJson,
    importJson,
    DEFAULT_PGA,
  };
})(window);
