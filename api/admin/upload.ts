import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { ApiRequest, ApiResponse } from '../../server/http'
import { methodNotAllowed, reply, requireAdmin, sameOrigin } from '../../server/http'

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(['application/pdf', 'image/png', 'image/jpeg']),
  data: z.string().min(1).max(4_200_000),
}).strict()
const maxBytes = 3 * 1024 * 1024

function matchesFileSignature(bytes: Buffer, contentType: string) {
  if (contentType === 'application/pdf') return bytes.subarray(0, 5).toString() === '%PDF-'
  if (contentType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (!sameOrigin(req)) return reply(res, 403, { error: 'Request origin is not allowed' })
  const parsed = uploadSchema.safeParse(req.body)
  if (!parsed.success) return reply(res, 400, { error: 'Choose a PDF, PNG, or JPEG file no larger than 3 MB' })

  const bytes = Buffer.from(parsed.data.data, 'base64')
  if (bytes.length === 0 || bytes.length > maxBytes || !matchesFileSignature(bytes, parsed.data.contentType)) {
    return reply(res, 400, { error: 'File type or size is invalid' })
  }

  try {
    const { supabase, user } = await requireAdmin(req, res)
    if (!user) return reply(res, 401, { error: 'Sign in as the administrator to continue' })
    const extension = parsed.data.contentType === 'application/pdf' ? 'pdf' : parsed.data.contentType === 'image/png' ? 'png' : 'jpg'
    const path = `${user.id}/${randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('portfolio-private').upload(path, bytes, {
      contentType: parsed.data.contentType,
      cacheControl: '3600',
      upsert: false,
    })
    if (error) return reply(res, 400, { error: 'Upload failed. Check storage configuration and file size.' })
    return reply(res, 201, { path, fileName: parsed.data.fileName, contentType: parsed.data.contentType })
  } catch {
    return reply(res, 503, { error: 'Storage service is not configured or unavailable' })
  }
}
