/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  // Prevent aggressive caching for HTML pages
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('cache-control', 'public, max-age=0, must-revalidate');
  }
  
  return response;
}
