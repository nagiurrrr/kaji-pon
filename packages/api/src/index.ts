import { DurableObject } from 'cloudflare:workers'
import type { HealthResponse } from '@kaji-pon/shared'

export class House extends DurableObject {
  health(): HealthResponse {
    return { ok: true }
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/health') {
      const house = env.HOUSE.get(env.HOUSE.idFromName('health'))
      return Response.json(await house.health())
    }
    return new Response('Not Found', { status: 404 })
  },
} satisfies ExportedHandler<{ HOUSE: DurableObjectNamespace<House> }>
