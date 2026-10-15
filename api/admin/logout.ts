import type { ApiRequest, ApiResponse } from '../../server/http'
import { createSessionClient, methodNotAllowed, reply, sameOrigin } from '../../server/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (!sameOrigin(req)) return reply(res, 403, { error: 'Request origin is not allowed' })
  try {
    const supabase = createSessionClient(req, res)
    await supabase.auth.signOut({ scope: 'local' })
    return reply(res, 200, { ok: true })
  } catch {
    return reply(res, 503, { error: 'Authentication service is unavailable' })
  }
}
