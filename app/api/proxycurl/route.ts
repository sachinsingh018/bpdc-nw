// app/api/proxycurl/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing LinkedIn URL' }, { status: 400 });
  }

  const apiKey = 'hZ7JOTaOzvR-2KuXhW51ew'; // Replace with your actual API key

  try {
    const proxyRes = await fetch(`https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!proxyRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch from ProxyCurl' }, { status: proxyRes.status });
    }

    const data = await proxyRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
