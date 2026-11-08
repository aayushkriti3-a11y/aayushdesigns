import { ndaPage, token, COOKIE } from '../lib/nda.js';

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const typed = String(form.get('password') || '').replace(/\s+/g, '').toLowerCase();
  let next = String(form.get('next') || '/');
  if (!/^\/(EWMCase|MaaSCase)(\.dc)?(\.html)?$/.test(next)) next = '/';
  const pass = env.NDA_PASSWORD ? env.NDA_PASSWORD.replace(/\s+/g, '').toLowerCase() : '';
  if (!pass || typed !== pass) {
    return Response.redirect(new URL(next + '?wrong=1', request.url).toString(), 303);
  }
  const t = await token(env.NDA_PASSWORD);
  return new Response(null, {
    status: 303,
    headers: {
      Location: next,
      'Set-Cookie': `${COOKIE}=${t}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}

export const onRequestGet = () => Response.redirect('https://aayushdesigns.com/', 302);
