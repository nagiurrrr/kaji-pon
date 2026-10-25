import type { Env } from './common/house'
import { handleHealth } from './features/health'

export { House } from './common/house'

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/health') return handleHealth(env)
    return new Response('Not Found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
