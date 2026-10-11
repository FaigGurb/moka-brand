// Language for the AR pages: ?lang= wins, then the site's saved choice, then Azerbaijani.
export const LANGS = ['az', 'en', 'ru'];
export function initLang(T, { home = '../', onChange } = {}) {
  const q = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('moka-lang'); } catch (e) {}
  let lang = LANGS.includes(q) ? q : LANGS.includes(saved) ? saved : 'az';
  const api = { t: T[lang], lang };
  function apply(l) {
    lang = l; api.lang = l; api.t = T[l];
    try { localStorage.setItem('moka-lang', l); } catch (e) {}
    document.documentElement.lang = l;
    document.querySelectorAll('[data-t]').forEach((el) => { const v = T[l][el.dataset.t]; if (v != null) el.textContent = v; });
    document.querySelectorAll('[data-t-aria]').forEach((el) => el.setAttribute('aria-label', T[l][el.dataset.tAria]));
    document.querySelectorAll('.langs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'));
    // site home (data-home) and AR hub (data-hub) keep the language
    document.querySelectorAll('[data-home]').forEach((a) => (a.href = l === 'az' ? home : home + l + '/'));
    document.querySelectorAll('[data-hub]').forEach((a) => (a.href = a.dataset.hub + (l === 'az' ? '' : '?lang=' + l)));
    onChange && onChange(T[l], l);
  }
  document.querySelectorAll('.langs button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.lang)));
  apply(lang);
  return api;
}
export const WORDMARK_SVG = '<svg viewBox="0 0 675 155" aria-hidden="true" class="wm"><defs><clipPath id="wmcut"><rect x="0" y="0" width="675" height="74.5"/><rect x="0" y="79.5" width="675" height="75.5"/></clipPath></defs><g fill="currentColor"><g clip-path="url(#wmcut)"><polygon points="32,4 87,47 145,4 172,149 2,150"/><circle cx="266" cy="77" r="76"/><polygon points="381,7 508,7 467,77 508,149 385,149 407,77"/><polygon points="597,4 671,149 522,149"/></g><path d="M384,20 C364,20 352,36 352,54 C352,74 368,86 386,86 L393,94" fill="none" stroke="currentColor" stroke-width="8"/></g></svg>';
