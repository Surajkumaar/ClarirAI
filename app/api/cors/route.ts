import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the target URL from the request body
    const { url, method = 'GET', body, headers = {} } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    console.log(`CORS Proxy: ${method} ${url}`);
    
    // Make the request to the target URL
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': headers['Content-Type'] || 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('CORS Proxy error:', error.message);
    return NextResponse.json(
      { error: `CORS Proxy error: ${error.message}` },
      { status: 500 }
    );
  }
}
