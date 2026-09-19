import { NextRequest, NextResponse } from 'next/server';
import { fetchWompiTransaction, getWompiConfiguration, verifyWompiEvent } from '@/lib/wompi-server';
import { reconcileWompi } from '@/lib/wompi-reconciliation';
export async function POST(request: NextRequest) {
  const config = getWompiConfiguration();
  const productionEndpoint = request.nextUrl.pathname.endsWith('/production');
  if (!config.credentialsConfigured || productionEndpoint !== (config.mode === 'production')) return NextResponse.json({ error: 'Wompi no disponible para este entorno' }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 65536) return NextResponse.json({ error: 'Evento demasiado grande' }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Evento inválido' }, { status: 400 }); }
  const event = verifyWompiEvent(input, config.eventsSecret, productionEndpoint ? 'prod' : 'test');
  if (!event) return NextResponse.json({ error: 'Firma o evento inválido' }, { status: 401 });
  try {
    const transaction = await fetchWompiTransaction(event.data.transaction.id);
    await reconcileWompi(transaction, config.mode);
    return NextResponse.json({ received: true, sandbox: config.mode === 'sandbox' });
  } catch (error) {
    const mismatch = error instanceof Error && /no coincide|ya está asociada/.test(error.message);
    return NextResponse.json({ error: mismatch ? 'El pago no coincide con la solicitud' : 'Verificación temporalmente no disponible' }, { status: mismatch ? 409 : 503 });
  }
}
