import { z } from 'zod'
import type { ApiRequest, ApiResponse } from '../../server/http'
import { methodNotAllowed, reply, requireAdmin, sameOrigin } from '../../server/http'

const passwordSchema = z.object({ currentPassword: z.string().min(1).max(1024), newPassword: z.string().min(12).max(128) }).strict()

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (!sameOrigin(req)) return reply(res, 403, { error: 'Request origin is not allowed' })
  const parsed = passwordSchema.safeParse(req.body)
  if (!parsed.success) return reply(res, 400, { error: 'New password must be 12–128 characters' })

  try {
    const { supabase, user } = await requireAdmin(req, res)
    if (!user?.email) return reply(res, 401, { error: 'Sign in as the administrator to continue' })
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword })
    if (verifyError) return reply(res, 401, { error: 'Current password is incorrect' })
    const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword })
    if (error) return reply(res, 400, { error: 'Password could not be changed. Try a different password.' })
    return reply(res, 200, { ok: true })
  } catch {
    return reply(res, 503, { error: 'Authentication service is unavailable' })
  }
}
