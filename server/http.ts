import type { IncomingMessage, ServerResponse } from 'node:http'
import { parseCookie, stringifySetCookie } from 'cookie'
import { createServerClient } from '@supabase/ssr'

export type ApiRequest = IncomingMessage & { body?: unknown }
export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse
  json(body: unknown): void
}

export function secureHeaders(res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('X-Frame-Options', 'DENY')
}

export function reply(res: ApiResponse, status: number, body: unknown) {
  secureHeaders(res)
  res.status(status).json(body)
}

export function sameOrigin(req: ApiRequest) {
  const origin = req.headers.origin
  const host = req.headers.host
  if (typeof origin !== 'string' || typeof host !== 'string') return false
  const forwardedProto = req.headers['x-forwarded-proto']
  const forwarded = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto
  const hostname = host.split(':')[0]
  const protocol = forwarded || (process.env.VERCEL && hostname !== 'localhost' && hostname !== '127.0.0.1' ? 'https' : 'http')
  try {
    return new URL(origin).origin === `${protocol}://${host}`
  } catch {
    return false
  }
}

export function createSessionClient(req: ApiRequest, res: ApiResponse) {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED')
  const forwardedProto = req.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto
  const host = req.headers.host?.split(':')[0]
  const secureCookie = protocol === 'https' || (Boolean(process.env.VERCEL) && host !== 'localhost' && host !== '127.0.0.1')

  return createServerClient(url, anonKey, {
    cookieOptions: { name: 'portfolio-session', path: '/', sameSite: 'strict', secure: secureCookie },
    cookies: {
      getAll() {
        const value = req.headers.cookie
        return Object.entries(parseCookie(Array.isArray(value) ? value.join(';') : value ?? '')).flatMap(([name, cookieValue]) => cookieValue === undefined ? [] : [{ name, value: cookieValue }])
      },
      setAll(cookiesToSet) {
        const serialized = cookiesToSet.map(({ name, value, options }) => stringifySetCookie({ name, value, ...options,
          path: '/',
          httpOnly: true,
          secure: secureCookie,
          sameSite: 'strict',
        }))
        res.setHeader('Set-Cookie', serialized)
      },
    },
  })
}

export async function requireAdmin(req: ApiRequest, res: ApiResponse) {
  const supabase = createSessionClient(req, res)
  const { data: { user }, error } = await supabase.auth.getUser()
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (error || !user || !configuredEmail || user.email?.toLowerCase() !== configuredEmail || user.app_metadata?.role !== 'admin') {
    return { supabase, user: null }
  }
  return { supabase, user }
}

export function methodNotAllowed(res: ApiResponse, methods: string[]) {
  res.setHeader('Allow', methods.join(', '))
  reply(res, 405, { error: 'Method not allowed' })
}
