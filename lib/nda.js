// Shared helpers for the NDA gate. The password lives in the Cloudflare env var NDA_PASSWORD, never in the repo.
export const NDA_PAGES = { EWMCase: 'EWM modernization', MaaSCase: 'MaaS360 onboarding' };
export const COOKIE = 'ak_nda';

export function ndaPage(pathname) {
  let p = pathname;
  try { p = decodeURIComponent(pathname); } catch (e) { return 'EWMCase'; }
  // Anything that could resolve to an NDA file, in any casing or encoding, goes through the gate.
  const m = p.toLowerCase().match(/(ewmcase|maascase)/);
  if (!m) return null;
  return m[1] === 'ewmcase' ? 'EWMCase' : 'MaaSCase';
}

export async function token(password) {
  const data = new TextEncoder().encode('aayushdesigns.com|' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function gatePage(page, next, wrong) {
  const title = NDA_PAGES[page] || 'this case study';
  const mail = 'mailto:aayush.kriti3@gmail.com?subject=' + encodeURIComponent('Access request: ' + title + ' case study');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)} · under NDA · Aayush Kriti</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=Kalam&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#F6EFE3;color:#2B1E16;font-family:'Instrument Sans',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px 16px}
.card{width:100%;max-width:460px;background:#FFFAF2;border:1.5px solid #2B1E16;border-radius:6px;box-shadow:0 2px 0 #EDE1CC,0 24px 60px rgba(43,30,22,.12);padding:28px 24px;display:flex;flex-direction:column;gap:16px}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.1em;color:#6B5242;border-bottom:2px dashed #CDB9A5;padding-bottom:12px}
h1{margin:0;font-size:28px;line-height:1.15;letter-spacing:-.02em}p{margin:0;font-size:15px;line-height:23px;color:#6B5242}
label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600}
input{font:inherit;font-size:16px;color:#2B1E16;background:#FFFCF5;border:1.5px solid #CDB9A5;border-radius:10px;padding:11px 12px;min-height:46px}
input:focus{outline:none;border-color:#2B1E16;box-shadow:0 0 0 3px rgba(237,169,42,.35)}
button{font:inherit;font-size:16px;font-weight:600;min-height:50px;border:0;border-radius:999px;background:#2B1E16;color:#FFFAF2;cursor:pointer}
button:hover{background:#C0391B}.err{color:#A32F15;font-weight:600;font-size:14px}
.links{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-size:14px}.links a{color:#2B1E16;font-weight:600}
.note{font-family:'Kalam',cursive;color:#C0391B;font-size:19px}
a:focus-visible,button:focus-visible{outline:2px solid #2B1E16;outline-offset:3px}
</style></head><body>
<main class="card">
<span class="eyebrow">UNDER NDA · ${esc(title.toUpperCase())}</span>
<h1>This dish is behind the pass</h1>
<p>The case study is under NDA. Enter the password I shared with you, or request access and I'll send it over.</p>
<form method="post" action="/unlock" style="display:flex;flex-direction:column;gap:12px">
<input type="hidden" name="next" value="${esc(next)}">
<label>Password<input type="password" name="password" autocomplete="current-password" required autofocus ${wrong ? 'aria-invalid="true"' : ''}></label>
${wrong ? '<p class="err" role="alert">That password didn\'t work. Try again?</p>' : ''}
<button type="submit">Open the case study</button>
</form>
<div class="links"><a href="${esc(mail)}">Request access</a><a href="/">← Back to the menu</a></div>
<span class="note">thanks for stopping by!</span>
</main></body></html>`;
}
