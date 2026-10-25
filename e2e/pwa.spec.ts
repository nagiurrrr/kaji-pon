import { expect, test, type APIRequestContext } from '@playwright/test'

// PNG の先頭 8 バイトの署名と、IHDR に入っている幅・高さを読む
async function readPng(request: APIRequestContext, url: string) {
  const res = await request.get(url)
  expect(res.status(), url).toBe(200)
  expect(res.headers()['content-type'], url).toContain('image/png')
  const buf = await res.body()
  expect(buf.subarray(0, 8).toString('hex'), `${url} は PNG`).toBe('89504e470d0a1a0a')
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

async function getManifest(request: APIRequestContext) {
  const res = await request.get('/manifest.webmanifest')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/json|manifest/)
  return res.json()
}

test('manifest が配られて、名前・起動・色の値を持つ', async ({ request }) => {
  const m = await getManifest(request)
  expect(m).toMatchObject({
    name: '家事ポン！',
    short_name: '家事ポン！',
    start_url: '/',
    display: 'standalone',
    theme_color: '#ffffff',
    background_color: '#ffffff',
  })
})

test('index.html が manifest・apple-touch-icon・iPhone 用 meta を指す', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest')
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content', '家事ポン！')
})

test('Chrome が「インストールできる」と判定する', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await expect
    .poll(() => page.evaluate(async () => (await navigator.serviceWorker.ready).active!.state))
    .toBe('activated')
  const cdp = await page.context().newCDPSession(page)
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors')
  expect(installabilityErrors).toEqual([])
})

test('manifest の icons に 192 と 512 の PNG があり、宣言どおりの大きさで返る', async ({ request }) => {
  const m = await getManifest(request)
  for (const size of [192, 512]) {
    const icon = m.icons.find((i: { sizes: string }) => i.sizes === `${size}x${size}`)
    expect(icon, `${size}x${size} のアイコン`).toBeTruthy()
    expect(icon.type).toBe('image/png')
    expect(await readPng(request, icon.src)).toEqual({ width: size, height: size })
  }
})

test('apple-touch-icon が 180×180 の PNG で返る', async ({ page, request }) => {
  await page.goto('/')
  const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')
  expect(href).toBeTruthy()
  expect(await readPng(request, href!)).toEqual({ width: 180, height: 180 })
})

test('ページを開くと Service Worker が /sw.js で登録され、activate される', async ({ page }) => {
  await page.goto('/')
  const script = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready
    return new URL(reg.active!.scriptURL).pathname
  })
  expect(script).toBe('/sw.js')
  await expect
    .poll(() => page.evaluate(async () => (await navigator.serviceWorker.ready).active!.state))
    .toBe('activated')
})

test('sw.js は fetch を聞くが、何もキャッシュしない', async ({ request }) => {
  const res = await request.get('/sw.js')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/javascript/)
  const src = await res.text()
  expect(src).toMatch(/addEventListener\(\s*['"]fetch['"]/)
  expect(src).not.toMatch(/\bcaches\b/)
  expect(src).not.toMatch(/respondWith/)
})
