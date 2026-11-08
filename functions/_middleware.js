import { ndaPage, token, readCookie, gatePage, COOKIE } from '../lib/nda.js';
import { NDA_ASSETS } from '../lib/nda-assets.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  if (NDA_ASSETS.has(url.pathname)) {
    const ok = env.NDA_PASSWORD && readCookie(request, COOKIE) === (await token(env.NDA_PASSWORD));
    if (!ok) return new Response('Under NDA', { status: 401, headers: { 'Cache-Control': 'no-store' } });
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('Cache-Control', 'private, max-age=86400');
    return out;
  }
  const page = ndaPage(url.pathname);
  if (!page) return next();

  const pass = env.NDA_PASSWORD;
  if (pass) {
    const have = readCookie(request, COOKIE);
    if (have && have === (await token(pass))) {
      const res = await next();
      const out = new Response(res.body, res);
      out.headers.set('Cache-Control', 'private, no-store');
      out.headers.set('X-Robots-Tag', 'noindex');
      return out;
    }
  }
  const wrong = url.searchParams.get('wrong') === '1';
  return new Response(gatePage(page, url.pathname, wrong), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
