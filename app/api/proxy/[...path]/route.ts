import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// The base URL for the Hugging Face Spaces backend
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://surajkumaar-clarirai.hf.space';

/**
 * Server-side API proxy to handle CORS issues
 * This route handles all methods (GET, POST, etc.) and forwards them to the backend
 */
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Ensure params is properly awaited at the beginning
  const pathSegments = await Promise.resolve(params.path);
  // Construct the path from the path segments
  const path = pathSegments.join('/');
  
  try {
    const url = `${BACKEND_URL}/${path}`;
    
    console.log(`Proxying GET request to: ${url}`);
    
    // Forward the request to the backend
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
      },
      responseType: path.includes('generate-report') ? 'arraybuffer' : 'json',
    });
    
    // If this is a report, return it as a blob
    if (path.includes('generate-report')) {
      return new NextResponse(response.data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="ClarirAI_Report.pdf"`,
        },
      });
    }
    
    // Return the response data
    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error(`Proxy GET error for ${path}:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * Handle POST requests
 */
export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Ensure params is properly awaited at the beginning
  const pathSegments = await Promise.resolve(params.path);
  // Construct the path from the path segments
  const path = pathSegments.join('/');
  
  try {
    const url = `${BACKEND_URL}/${path}`;
    
    console.log(`Proxying POST request to: ${url}`);
    
    // Get the request body
    let body;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      body = formData;
    } else {
      // Handle JSON data
      body = await request.json().catch(() => ({}));
    }
    
    // Forward the request to the backend
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': contentType,
        'Accept': 'application/json',
      },
    });
    
    // Return the response data
    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error(`Proxy POST error for ${path}:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: error.response?.status || 500 }
    );
  }
}
