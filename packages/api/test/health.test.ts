import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('GET /api/health', () => {
  it('200 で {"ok": true} を返す', async () => {
    const res = await SELF.fetch('https://example.com/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('/api/ の下の存在しないパスは 404', async () => {
    const res = await SELF.fetch('https://example.com/api/no-such-path')
    expect(res.status).toBe(404)
  })
})
