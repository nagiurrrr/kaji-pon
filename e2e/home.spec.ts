import { expect, test } from '@playwright/test'

test('/ を開くと title が「家事ポン！」', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('家事ポン！')
  await expect(page.getByRole('heading', { name: '家事ポン！' })).toBeVisible()
})

test('スマホの画面幅（390×844）でも表示される', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page).toHaveTitle('家事ポン！')
  await expect(page.getByRole('heading', { name: '家事ポン！' })).toBeVisible()
})

test('同じサーバで画面と API の両方を返す', async ({ request }) => {
  const health = await request.get('/api/health')
  expect(health.status()).toBe(200)
  expect(await health.json()).toEqual({ ok: true })

  const missing = await request.get('/api/no-such-path')
  expect(missing.status()).toBe(404)
})
