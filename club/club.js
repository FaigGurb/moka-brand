/*
 * MOKA Club — concept loyalty wallet shared by the games, the AR pages and the site.
 * Stored only in this browser (localStorage 'moka-club-v1'). In a real programme the
 * balance and codes would live in MOKA's account / POS system; here everything is a demo.
 * Classic script: exposes window.MokaClub.
 */
(function () {
  var KEY = 'moka-club-v1';
  var DAILY_CAP = 100; // max points per source per day
  var SOURCES = ['line', 'rain', 'memory', 'arCard', 'arTable', 'arSelfie'];
  var PASSPORT_BONUS = 100;
  var REWARDS = [
    { id: 'size', cost: 150 },
    { id: 'ten', cost: 300 },
    { id: 'filter', cost: 600 },
  ];

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function blank() {
    return { points: 0, lifetime: 0, log: [], stamps: {}, daily: { date: today(), bySrc: {} }, codes: [], passport: false };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s || typeof s.points !== 'number') return blank();
      if (!s.daily || s.daily.date !== today()) s.daily = { date: today(), bySrc: {} };
      s.stamps = s.stamps || {};
      s.codes = s.codes || [];
      s.log = s.log || [];
      return s;
    } catch (e) {
      return blank();
    }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('mokaclub', { detail: s })); } catch (e) {}
  }

  /**
   * Adds points from a source, respecting the daily cap. Also stamps the passport.
   * Returns { added, capped, stamp (first stamp ever for this source), passport (just completed) }.
   */
  function award(src, pts) {
    var s = load();
    var used = s.daily.bySrc[src] || 0;
    var room = Math.max(0, DAILY_CAP - used);
    var added = Math.max(0, Math.min(Math.round(pts), room));
    var stamp = !s.stamps[src];
    if (stamp) s.stamps[src] = Date.now();
    var passport = false;
    if (!s.passport && SOURCES.every(function (k) { return s.stamps[k]; })) {
      s.passport = true;
      passport = true;
      s.points += PASSPORT_BONUS;
      s.lifetime += PASSPORT_BONUS;
      s.log.unshift({ t: Date.now(), src: 'passport', pts: PASSPORT_BONUS });
    }
    if (added > 0) {
      s.points += added;
      s.lifetime += added;
      s.daily.bySrc[src] = used + added;
      s.log.unshift({ t: Date.now(), src: src, pts: added });
    }
    s.log = s.log.slice(0, 40);
    save(s);
    return { added: added, capped: added < Math.round(pts), stamp: stamp, passport: passport, total: s.points };
  }

  function code() {
    // MOKA-XXXX-XX: the last pair is a simple checksum a cashier app could verify
    var A = 'ACDEFGHJKLMNPQRTUVWXY3479';
    var body = '';
    for (var i = 0; i < 4; i++) body += A[Math.floor(Math.random() * A.length)];
    var sum = 0;
    for (var j = 0; j < body.length; j++) sum += body.charCodeAt(j) * (j + 7);
    return 'MOKA-' + body + '-' + A[sum % A.length] + A[(sum * 3) % A.length];
  }

  function claim(id) {
    var r = REWARDS.filter(function (x) { return x.id === id; })[0];
    var s = load();
    if (!r || s.points < r.cost) return null;
    s.points -= r.cost;
    var c = { id: id, code: code(), at: Date.now(), exp: Date.now() + 7 * 864e5 };
    s.codes.unshift(c);
    s.log.unshift({ t: Date.now(), src: 'claim:' + id, pts: -r.cost });
    save(s);
    return c;
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    save(blank());
  }

  /** Small toast in the corner: "+40 · MOKA Club". */
  function toast(text, href) {
    var el = document.createElement(href ? 'a' : 'div');
    if (href) el.href = href;
    el.textContent = text;
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);z-index:9999;' +
      'background:#1B1714;color:#F5F1EA;border:1.5px solid #FFE2A6;padding:11px 16px;font:700 13px Mulish,Arial,sans-serif;letter-spacing:.06em;' +
      'text-decoration:none;opacity:0;transition:opacity .35s,transform .35s;box-shadow:0 12px 30px rgba(0,0,0,.35);white-space:nowrap';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)'; });
    setTimeout(function () { el.style.opacity = '0'; el.style.transform = 'translate(-50%,20px)'; }, 3600);
    setTimeout(function () { el.remove(); }, 4100);
  }

  window.MokaClub = {
    KEY: KEY, SOURCES: SOURCES, REWARDS: REWARDS, DAILY_CAP: DAILY_CAP, PASSPORT_BONUS: PASSPORT_BONUS,
    state: load, award: award, claim: claim, reset: reset, toast: toast,
  };
})();
