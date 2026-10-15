import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isAdminPath } from '../src/routes.ts'

describe('admin route matching', () => {
  it('matches admin paths on a root-hosted deployment', () => {
    assert.equal(isAdminPath('/admin/login', '/'), true)
    assert.equal(isAdminPath('/admin', '/'), true)
  })

  it('matches admin paths below the GitHub Pages project base', () => {
    assert.equal(isAdminPath('/chandan-personal-workspace/admin/login', '/chandan-personal-workspace/'), true)
    assert.equal(isAdminPath('/chandan-personal-workspace/about', '/chandan-personal-workspace/'), false)
  })

  it('does not treat unrelated paths as admin paths', () => {
    assert.equal(isAdminPath('/', '/'), false)
    assert.equal(isAdminPath('/administer', '/'), false)
  })
})
