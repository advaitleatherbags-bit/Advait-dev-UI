const API_BASE = process.env.API_URL

const ALLOWED_API_ROOTS = new Set([
  'Auth',
  'Cart',
  'Categories',
  'orders',
  'payment-status',
  'Products',
  'UserLikes',
])

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'])
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

async function proxyRequest(request, context) {
  if (!API_BASE) {
    return Response.json({ error: 'API_URL is not configured' }, { status: 500 })
  }

  if (!ALLOWED_METHODS.has(request.method)) {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const { path = [] } = await context.params
  if (
    path.length === 0 ||
    !ALLOWED_API_ROOTS.has(path[0]) ||
    path.some((segment) => !segment || segment === '.' || segment === '..' || /[\\/]/.test(segment))
  ) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  let upstreamUrl
  try {
    upstreamUrl = new URL(API_BASE)
    if (!['http:', 'https:'].includes(upstreamUrl.protocol)) throw new Error('Invalid protocol')
  } catch {
    return Response.json({ error: 'API_URL must be a valid HTTP or HTTPS URL' }, { status: 500 })
  }

  const basePath = upstreamUrl.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '')
  const endpoint = path.map((segment) => encodeURIComponent(segment)).join('/')
  upstreamUrl.pathname = `${basePath}/${endpoint}`
  upstreamUrl.search = new URL(request.url).search

  const headers = new Headers()
  request.headers.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && name.toLowerCase() !== 'cookie') {
      headers.set(name, value)
    }
  })

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      cache: 'no-store',
      redirect: 'manual',
      // The request body is streamed through to the backend.
      ...(request.body ? { duplex: 'half' } : {}),
    })

    const responseHeaders = new Headers()
    upstreamResponse.headers.forEach((value, name) => {
      const normalizedName = name.toLowerCase()
      // Do not pass backend redirects through; their Location header could expose its host.
      if (!HOP_BY_HOP_HEADERS.has(normalizedName) && normalizedName !== 'location') {
        responseHeaders.set(name, value)
      }
    })

    return new Response(
      ['HEAD'].includes(request.method) || upstreamResponse.status === 204 || upstreamResponse.status === 304
        ? null
        : upstreamResponse.body,
      { status: upstreamResponse.status, headers: responseHeaders },
    )
  } catch (error) {
    console.error('Backend proxy request failed:', error)
    return Response.json({ error: 'Backend is unavailable' }, { status: 502 })
  }
}

export const GET = proxyRequest
export const HEAD = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
