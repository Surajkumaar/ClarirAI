"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"
import getProxiedUrl from "@/lib/cors-proxy"

type ApiEndpoint = {
  name: string
  endpoint: string
  status: "online" | "offline" | "checking"
  method: "GET" | "POST"
}

export default function ApiStatus() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: "Prediction API", endpoint: "/predict", status: "checking", method: "POST" },
    { name: "Consultation API", endpoint: "/consult", status: "checking", method: "POST" },
    { name: "Report Generation", endpoint: "/generate-report", status: "checking", method: "GET" },
    { name: "Health Check", endpoint: "/health", status: "checking", method: "GET" },
    { name: "Model Information", endpoint: "/model-info", status: "checking", method: "GET" },
  ])
  const [backendUrl, setBackendUrl] = useState<string>("");

  useEffect(() => {
    // Get the backend URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    setBackendUrl(apiUrl);
    
    const checkApiStatus = async () => {
      const updatedEndpoints = [...endpoints];
      
      // Only check the health endpoint to avoid too many requests
      const healthEndpoint = updatedEndpoints.find(e => e.endpoint === "/health");
      if (healthEndpoint) {
        const healthIndex = updatedEndpoints.indexOf(healthEndpoint);
        try {
          // Try to check the health endpoint
          await axios.get(getProxiedUrl("/health"), { timeout: 8000 });
          
          // If successful, mark all endpoints as online (assuming backend is up)
          updatedEndpoints.forEach((endpoint, index) => {
            updatedEndpoints[index] = { ...endpoint, status: "online" };
          });
        } catch (error) {
          console.error(`Error checking health endpoint:`, error);
          
          // If health check fails, mark all endpoints as offline
          updatedEndpoints.forEach((endpoint, index) => {
            updatedEndpoints[index] = { ...endpoint, status: "offline" };
          });
        }
      }
      
      setEndpoints(updatedEndpoints);
    };

    // Check API status when component mounts
    checkApiStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Backend API Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {endpoints.map((endpoint) => (
            <div key={endpoint.endpoint} className="flex items-center justify-between p-3 rounded-md border">
              <div>
                <p className="font-medium">{endpoint.name}</p>
                <p className="text-xs text-muted-foreground">
                  {endpoint.method} {endpoint.endpoint}
                </p>
              </div>
              <div>
                {endpoint.status === "checking" ? (
                  <Badge variant="outline" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking
                  </Badge>
                ) : endpoint.status === "online" ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
                    <XCircle className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">Connected to: {backendUrl}</p>
      </CardContent>
    </Card>
  )
}
