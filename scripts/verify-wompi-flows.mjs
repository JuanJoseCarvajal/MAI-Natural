import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.MAI_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MAI_TEST_URL || 'http://127.0.0.1:3100';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Run only against an isolated local test server.');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const destinations = [];
// Never contact Wompi or create a real transaction during this verification.
await context.route('https://checkout.wompi.co/**', route => {
  destinations.push(new URL(route.request().url()));
  return route.fulfill({ contentType: 'text/html', body: '<h1>Destino Wompi interceptado para prueba local</h1>' });
});
const assertClean = async () => assert.doesNotMatch(await page.locator('body').innerText(), /transferencia|bancolombia|consignación|comprobante/i);
async function purchase(fromRitual) {
  await page.goto(base + (fromRitual ? '/routines' : '/products/fa-lam-120-1'));
  if (fromRitual) await page.getByRole('button', { name: 'Agregar el kit a mi bolsa ↗', exact: true }).click();
  else await page.getByRole('button', { name: 'Agregar al carrito', exact: true }).click();
  if (await page.locator('aside[aria-label="Carrito de compras"]').getAttribute('aria-hidden') === 'true') {
    await page.getByRole('button', { name: /Abrir carrito/ }).click();
  }
  const cart = page.getByRole('dialog', { name: 'Carrito de compras' });
  await cart.getByRole('link', { name: 'Continuar al pago con Wompi' }).waitFor();
  await cart.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  assert.doesNotMatch(await cart.innerText(), /transferencia|bancolombia/i);
  if (!fromRitual) await page.screenshot({ path: '/tmp/mai-wompi-carrito.png' });
  await cart.getByRole('link', { name: 'Continuar al pago con Wompi' }).click();
  await page.getByRole('heading', { name: 'Tu cuidado, casi en casa.' }).waitFor();
  await assertClean();
  await page.locator('[name=customerName]').fill('Prueba local Wompi');
  await page.locator('[name=customerEmail]').fill('wompi-local@example.com');
  await page.locator('[name=customerPhone]').fill('3001234567');
  await page.locator('[name=city]').fill('Medellín');
  await page.locator('dl').getByText('$ 15.000', { exact: true }).waitFor();
  await page.locator('[name=city]').fill(fromRitual ? 'Medellín' : 'Bogotá');
  await page.getByText('Total a pagar', { exact: true }).waitFor();
  await page.locator('[name=address]').fill('Calle 10 # 20-30');
  if (!fromRitual) await page.screenshot({ path: '/tmp/mai-wompi-checkout.png', fullPage: true });
  await page.getByRole('button', { name: 'Continuar a Wompi · prueba →', exact: true }).click();
  await page.waitForURL('https://checkout.wompi.co/**');
  const url = destinations.at(-1);
  assert.ok(url.searchParams.get('reference').startsWith('mai-'));
  assert.equal(url.searchParams.get('currency'), 'COP');
  assert.ok(Number(url.searchParams.get('amount-in-cents')) > 1000000);
  assert.ok(url.searchParams.get('signature:integrity'));
  await page.goto(base + '/products');
  await page.evaluate(() => localStorage.removeItem('mai-cart'));
}
try {
  const status = await (await page.request.get(base + '/api/payments/wompi/status')).json();
  assert.equal(status.mode, 'sandbox');
  assert.equal(status.available, true);

  await purchase(false);
  await purchase(true);
  await page.goto(base + '/services');
  await assertClean();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('radio', { name: /Mi piel y cómo la cuido/ }).check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('radio', { name: /Salir con una orientación concreta/ }).check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('¿Qué día te gustaría?').fill(new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10));
  await page.locator('input[name="time"]').first().check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('¿Cómo te llamas?').fill('Prueba local Wompi');
  await page.getByLabel('Tu correo electrónico').fill('wompi-local@example.com');
  await page.getByLabel('Tu teléfono de contacto').fill('3001234567');
  await page.getByRole('button', { name: 'Revisar mi encuentro' }).click();
  await page.getByRole('checkbox', { name: /Autorizo a MAI/ }).check();
  await page.getByRole('button', { name: 'Continuar a Wompi · prueba', exact: true }).click();
  await page.waitForURL('https://checkout.wompi.co/**');
  assert.ok(destinations.at(-1).searchParams.get('reference').startsWith('mai-appointment-'));
  assert.equal(destinations.at(-1).searchParams.get('amount-in-cents'), '5000000');
  assert.equal(destinations.length, 3);
  assert.deepEqual(errors, []);
  console.log('PASS Tienda → carrito → checkout → Wompi; Tu Ritual → carrito → checkout → Wompi; Asesoría → formulario → Wompi. Destinos interceptados, sin cobros ni conexión a Wompi.');
} catch (error) {
  console.error('Current page:', page.url(), await page.locator('body').innerText());
  await page.screenshot({ path: '/tmp/mai-wompi-flow-failure.png', fullPage: true });
  throw error;
} finally { await browser.close(); }
