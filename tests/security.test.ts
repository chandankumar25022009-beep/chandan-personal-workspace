import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fallbackContent from '../src/data/portfolio.json'
import { contentSchema } from '../server/content.ts'
import { sameOrigin } from '../server/http.ts'
import { allowLoginAttempt } from '../server/rate-limit.ts'
import { preparePublicContent } from '../server/public-content.ts'
import type { PortfolioContent } from '../src/data/types'
import contentHandler from '../api/content.ts'
import loginHandler from '../api/admin/login.ts'
import type { ApiRequest, ApiResponse } from '../server/http.ts'

const validContent = JSON.parse(JSON.stringify(fallbackContent)) as PortfolioContent

describe('portfolio content validation', () => {
  it('accepts the checked-in honest starter content', () => {
    assert.equal(contentSchema.safeParse(validContent).success, true)
  })

  it('rejects non-HTTPS public links', () => {
    const value = JSON.parse(JSON.stringify(validContent)) as PortfolioContent
    value.profile.social.github = 'javascript:alert(1)'
    assert.equal(contentSchema.safeParse(value).success, false)
  })

  it('rejects unsupported skill states and excessive collection sizes', () => {
    const invalidState = JSON.parse(JSON.stringify(validContent)) as PortfolioContent
    invalidState.skills[0].status = 'Expert' as typeof invalidState.skills[0]['status']
    assert.equal(contentSchema.safeParse(invalidState).success, false)
    const tooMany = JSON.parse(JSON.stringify(validContent)) as PortfolioContent
    tooMany.projects = Array.from({ length: 51 }, (_, index) => ({ id: `p-${index}`, name: `Project ${index}`, problem: '', description: '', technologies: [], dataset: '', findings: '', githubUrl: '', demoUrl: '', status: 'Planned', published: false }))
    assert.equal(contentSchema.safeParse(tooMany).success, false)
  })

  it('removes private resume URLs and unpublished projects/files from public content', () => {
    const value = JSON.parse(JSON.stringify(validContent)) as PortfolioContent
    value.resume = { ...value.resume, isPublic: false, storagePath: 'admin/private-resume.pdf' }
    value.projects = [{ id: 'hidden', name: 'Draft', problem: '', description: '', technologies: [], dataset: '', findings: '', githubUrl: '', demoUrl: '', status: 'In Progress', published: false }]
    value.certificates = [
      { id: 'private-cert', title: 'Private file', issuer: '', date: '', fileUrl: '', storagePath: 'admin/private.pdf', verificationUrl: '', published: true },
      { id: 'draft-cert', title: 'Draft', issuer: '', date: '', fileUrl: '', storagePath: null, verificationUrl: '', published: false },
    ]
    const result = preparePublicContent(value)
    assert.equal(result.content.resume.url, null)
    assert.equal(result.resumePath, null)
    assert.equal(result.content.resume.storagePath, null)
    assert.equal(result.content.projects.length, 0)
    assert.equal(result.content.certificates.length, 1)
    assert.equal(result.content.certificates[0].fileUrl, '')
    assert.equal(result.content.certificates[0].storagePath, null)
    assert.deepEqual(result.certificateFiles, [{ id: 'private-cert', path: 'admin/private.pdf' }])
  })
})

describe('admin request protection', () => {
  it('accepts only an exact same-origin request', () => {
    const good = { headers: { origin: 'https://portfolio.example', host: 'portfolio.example', 'x-forwarded-proto': 'https' } }
    const bad = { headers: { origin: 'https://attacker.example', host: 'portfolio.example', 'x-forwarded-proto': 'https' } }
    assert.equal(sameOrigin(good as never), true)
    assert.equal(sameOrigin(bad as never), false)
    assert.equal(sameOrigin({ headers: { host: 'portfolio.example' } } as never), false)
    const previousVercel = process.env.VERCEL
    process.env.VERCEL = '1'
    assert.equal(sameOrigin({ headers: { origin: 'http://localhost:3000', host: 'localhost:3000', 'x-forwarded-proto': 'http' } } as never), true)
    if (previousVercel === undefined) delete process.env.VERCEL
    else process.env.VERCEL = previousVercel
  })

  it('throttles repeated login attempts and resets after the window', () => {
    const key = `test-${Math.random()}`
    const start = 1_700_000_000_000
    for (let attempt = 0; attempt < 8; attempt += 1) assert.equal(allowLoginAttempt(key, start + attempt).allowed, true)
    const limited = allowLoginAttempt(key, start + 9)
    assert.equal(limited.allowed, false)
    assert.ok(limited.retryAfter > 0)
    assert.equal(allowLoginAttempt(key, start + 15 * 60 * 1000 + 1).allowed, true)
  })

  it('returns fallback public content and fails login closed without Supabase configuration', async () => {
    const names = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'ADMIN_EMAIL'] as const
    const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]))
    for (const name of names) delete process.env[name]
    const makeResponse = () => {
      const result: { code?: number; body?: unknown; headers: Record<string, string | string[]> } = { headers: {} }
      const response = {
        status(code: number) { result.code = code; return response },
        setHeader(name: string, value: string | string[]) { result.headers[name] = value; return response },
        json(body: unknown) { result.body = body },
      }
      return { result, response: response as unknown as ApiResponse }
    }
    try {
      const publicResponse = makeResponse()
      await contentHandler({ method: 'GET', headers: {} } as ApiRequest, publicResponse.response)
      assert.equal(publicResponse.result.code, 200)
      assert.equal((publicResponse.result.body as PortfolioContent).profile.name, 'Chandan Kumar')

      const loginResponse = makeResponse()
      const protocol = process.env.VERCEL ? 'https' : 'http'
      await loginHandler({ method: 'POST', headers: { origin: `${protocol}://portfolio.test`, host: 'portfolio.test', 'x-forwarded-proto': protocol }, body: { email: 'admin@example.com', password: 'not-a-real-password' } } as unknown as ApiRequest, loginResponse.response)
      assert.equal(loginResponse.result.code, 503)
      assert.match(String((loginResponse.result.body as { error: string }).error), /not configured/i)
    } finally {
      for (const name of names) {
        if (previous[name] === undefined) delete process.env[name]
        else process.env[name] = previous[name]
      }
    }
  })
})
