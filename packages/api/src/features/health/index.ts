import type { Env } from '../../common/house'

export async function handleHealth(env: Env): Promise<Response> {
  const house = env.HOUSE.get(env.HOUSE.idFromName('health'))
  return Response.json(await house.health())
}
