import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const GEOCODING_API_KEY = process.env.GOOGLE_ROUTES_API_KEY;

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ success: false, message: 'Se requieren lat y lng' }, { status: 400 });
  }

  if (!GEOCODING_API_KEY) {
    return NextResponse.json({ success: false, message: 'API key de geocoding no configurada' }, { status: 503 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${GEOCODING_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json({ success: false, message: `Geocoding: ${data.status}` }, { status: 422 });
    }

    // Preferir street_address o route para mayor precisión
    const mejor = data.results.find(r =>
      r.types.includes('street_address') || r.types.includes('route')
    ) || data.results[0];

    return NextResponse.json({ success: true, address: mejor.formatted_address });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error de geocodificación', error: error.message }, { status: 500 });
  }
}
