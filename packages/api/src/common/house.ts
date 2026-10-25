import { DurableObject } from 'cloudflare:workers'
import type { HealthResponse } from '@kaji-pon/shared'

export class House extends DurableObject {
  health(): HealthResponse {
    return { ok: true }
  }
}

export type Env = { HOUSE: DurableObjectNamespace<House> }
