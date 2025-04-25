"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TestConnection() {
  const [status, setStatus] = useState<string>("Testing connection...");
  const [error, setError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>("");

  useEffect(() => {
    // Get the backend URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    setBackendUrl(apiUrl);

    // Test direct connection
    const testConnection = async () => {
      try {
        // First try with /api prefix
        const url = `${apiUrl}/health`;
        console.log("Testing connection to:", url);
        
        const response = await axios.get(url, {
          // Add CORS headers
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        setStatus(`Connected successfully! Response: ${JSON.stringify(response.data)}`);
      } catch (err: any) {
        console.error("Connection test failed:", err);
        setError(err.message || "Unknown error");
        
        // Try alternative URL format without /api
        try {
          const baseUrl = apiUrl.replace("/api", "");
          const altUrl = `${baseUrl}/health`;
          console.log("Trying alternative URL:", altUrl);
          
          const response = await axios.get(altUrl, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          setStatus(`Connected successfully with alternative URL! Response: ${JSON.stringify(response.data)}`);
          setError(null);
        } catch (altErr: any) {
          console.error("Alternative connection test failed:", altErr);
          setError(`Both connection attempts failed. Original error: ${err.message}, Alternative error: ${altErr.message}`);
        }
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md bg-white/50 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Backend Connection Test</h2>
      <p className="mb-2"><strong>Backend URL:</strong> {backendUrl}</p>
      <p className="mb-2"><strong>Status:</strong> {status}</p>
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
          <p><strong>Error:</strong> {error}</p>
          <p className="mt-2 text-sm">
            Possible solutions:
            <ul className="list-disc pl-5 mt-1">
              <li>Check if your Hugging Face Space is running</li>
              <li>Verify the correct URL format (try with and without /api)</li>
              <li>Check if CORS is enabled on your backend</li>
              <li>Try using a CORS proxy for development</li>
            </ul>
          </p>
        </div>
      )}
    </div>
  );
}
