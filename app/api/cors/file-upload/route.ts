import { NextRequest, NextResponse } from 'next/server';

/**
 * Special CORS proxy for file uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Get the target URL from the request query parameters
    const searchParams = request.nextUrl.searchParams;
    const targetUrl = searchParams.get('url');
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    }
    
    console.log(`File Upload Proxy: POST ${targetUrl}`);
    
    // Get the form data from the request
    const formData = await request.formData();
    console.log('Form data keys:', [...formData.keys()]);
    
    // Forward the request with the form data
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    });
    
    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('File Upload Proxy error:', error.message);
    return NextResponse.json(
      { error: `File Upload Proxy error: ${error.message}` },
      { status: 500 }
    );
  }
}
