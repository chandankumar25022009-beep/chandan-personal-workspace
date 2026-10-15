import type { ApiRequest, ApiResponse } from '../../server/http'
import { contentSchema } from '../../server/content'
import { methodNotAllowed, reply, requireAdmin, sameOrigin } from '../../server/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'GET') {
    try {
      const { supabase, user } = await requireAdmin(req, res)
      if (!user) return reply(res, 401, { error: 'Sign in as the administrator to continue' })
      const [{ data: published }, { data: draft }] = await Promise.all([
        supabase.from('portfolio_content').select('content, updated_at').eq('id', 'main').maybeSingle(),
        supabase.from('portfolio_drafts').select('content, updated_at').eq('id', 'main').maybeSingle(),
      ])
      const draftIsNewer = Boolean(draft?.content && (!published?.updated_at || draft.updated_at > published.updated_at))
      const current = draftIsNewer ? draft?.content : published?.content ?? draft?.content ?? null
      return reply(res, 200, { published: published?.content ?? null, draft: current, updatedAt: draftIsNewer ? draft?.updated_at : published?.updated_at ?? draft?.updated_at ?? null })
    } catch {
      return reply(res, 503, { error: 'Content service is not configured or unavailable' })
    }
  }

  if (req.method !== 'PUT') return methodNotAllowed(res, ['GET', 'PUT'])
  if (!sameOrigin(req)) return reply(res, 403, { error: 'Request origin is not allowed' })

  const body = req.body as { mode?: unknown; content?: unknown } | undefined
  if (!body || (body.mode !== 'draft' && body.mode !== 'publish')) return reply(res, 400, { error: 'Choose draft or publish mode' })
  if (JSON.stringify(body.content ?? null).length > 1_000_000) return reply(res, 413, { error: 'Portfolio content exceeds the 1 MB limit' })
  const parsed = contentSchema.safeParse(body.content)
  if (!parsed.success) return reply(res, 400, { error: 'Content validation failed', issues: parsed.error.issues.slice(0, 12).map((issue) => ({ path: issue.path.join('.'), message: issue.message })) })

  try {
    const { supabase, user } = await requireAdmin(req, res)
    if (!user) return reply(res, 401, { error: 'Sign in as the administrator to continue' })
    const table = body.mode === 'draft' ? 'portfolio_drafts' : 'portfolio_content'
    const payload = { id: 'main', content: parsed.data, published: body.mode === 'publish', updated_at: new Date().toISOString() }
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' })
    if (error) return reply(res, 500, { error: 'Could not save content. Check database policies and setup.' })
    return reply(res, 200, { ok: true, mode: body.mode, updatedAt: payload.updated_at })
  } catch {
    return reply(res, 503, { error: 'Content service is not configured or unavailable' })
  }
}
