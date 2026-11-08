// Cloudflare Worker: serves the static site from /public and keeps the NDA case studies behind a server-side password.
// The password is the NDA_PASSWORD variable/secret set in the Cloudflare dashboard, never in this repo.
import { ndaPage, token, readCookie, gatePage, COOKIE } from '../lib/nda.js';
import { NDA_ASSETS } from '../lib/nda-assets.js';

const PAGE_PATH = /^\/(EWMCase|MaaSCase)(\.dc)?(\.html)?$/;

async function hasPass(request, env) {
  if (!env.NDA_PASSWORD) return false;
  return readCookie(request, COOKIE) === (await token(env.NDA_PASSWORD));
}

function withHeaders(res, headers) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
  return out;
}

async function unlock(request, env) {
  const form = await request.formData();
  const typed = String(form.get('password') || '').replace(/\s+/g, '').toLowerCase();
  let next = String(form.get('next') || '/');
  if (!PAGE_PATH.test(next)) next = '/';
  const pass = env.NDA_PASSWORD ? env.NDA_PASSWORD.replace(/\s+/g, '').toLowerCase() : '';
  if (!pass || typed !== pass) {
    return Response.redirect(new URL(next + '?wrong=1', request.url).toString(), 303);
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: next,
      'Set-Cookie': `${COOKIE}=${await token(env.NDA_PASSWORD)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/unlock') {
      if (request.method === 'POST') return unlock(request, env);
      return Response.redirect(new URL('/', request.url).toString(), 302);
    }

    if (NDA_ASSETS.has(url.pathname)) {
      if (!(await hasPass(request, env))) return new Response('Under NDA', { status: 401, headers: { 'Cache-Control': 'no-store' } });
      return withHeaders(await env.ASSETS.fetch(request), { 'Cache-Control': 'private, max-age=86400' });
    }

    const page = ndaPage(url.pathname);
    if (page) {
      if (await hasPass(request, env)) {
        return withHeaders(await env.ASSETS.fetch(request), { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' });
      }
      return new Response(gatePage(page, url.pathname, url.searchParams.get('wrong') === '1'), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
