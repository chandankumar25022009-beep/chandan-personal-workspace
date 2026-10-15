import { z } from 'zod'
import type { ApiRequest, ApiResponse } from '../../server/http'
import { createSessionClient, methodNotAllowed, reply, sameOrigin } from '../../server/http'
import { allowLoginAttempt } from '../../server/rate-limit'

const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(1024) }).strict()

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (!sameOrigin(req)) return reply(res, 403, { error: 'Request origin is not allowed' })
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !configuredEmail) {
    return reply(res, 503, { error: 'Admin authentication is not configured yet' })
  }

  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || 'unknown'
  const limit = allowLoginAttempt(ip)
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter))
    return reply(res, 429, { error: 'Too many login attempts. Try again later.' })
  }

  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return reply(res, 400, { error: 'Enter a valid email and password' })
  try {
    const supabase = createSessionClient(req, res)
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
    if (error || !data.user) return reply(res, 401, { error: 'Email or password is incorrect' })

    const isAdmin = data.user.email?.toLowerCase() === configuredEmail && data.user.app_metadata?.role === 'admin'
    if (!isAdmin) {
      await supabase.auth.signOut({ scope: 'local' })
      return reply(res, 403, { error: 'This account is not configured as the portfolio administrator' })
    }
    return reply(res, 200, { user: { email: data.user.email } })
  } catch {
    return reply(res, 503, { error: 'Authentication service is temporarily unavailable' })
  }
}
