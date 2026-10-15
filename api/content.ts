import { createClient } from '@supabase/supabase-js'
import type { ApiRequest, ApiResponse } from '../server/http'
import { reply } from '../server/http'
import fallbackContent from '../src/data/portfolio.json'
import type { PortfolioContent } from '../src/data/types'
import { preparePublicContent } from '../server/public-content'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return reply(res, 405, { error: 'Method not allowed' })
  }
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return reply(res, 200, fallbackContent)

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await supabase
      .from('portfolio_content')
      .select('content')
      .eq('id', 'main')
      .eq('published', true)
      .maybeSingle()
    if (error || !data?.content) return reply(res, 200, fallbackContent)
    const prepared = preparePublicContent(structuredClone(data.content) as PortfolioContent)
    const content = prepared.content
    if (prepared.resumePath && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const signer = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
      const { data: signed } = await signer.storage.from('portfolio-private').createSignedUrl(prepared.resumePath, 300)
      content.resume.url = signed?.signedUrl ?? null
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && prepared.certificateFiles.length) {
      const signer = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
      const signedFiles = await Promise.all(prepared.certificateFiles.map(async ({ id, path }) => {
        const { data: signed } = await signer.storage.from('portfolio-private').createSignedUrl(path, 300)
        return [id, signed?.signedUrl ?? ''] as const
      }))
      const urls = new Map(signedFiles)
      content.certificates = content.certificates.map((certificate) => ({ ...certificate, fileUrl: urls.get(certificate.id) ?? certificate.fileUrl }))
    }
    return reply(res, 200, content)
  } catch {
    return reply(res, 200, fallbackContent)
  }
}
