# ClarirAI Frontend Deployment Guide

## Deploying to Render

This guide will walk you through deploying the ClarirAI frontend to Render while connecting it to your existing Hugging Face backend.

### Prerequisites

1. A Render account (https://render.com)
2. Your Hugging Face Space URL (https://surajkumaar-clarirai.hf.space)
3. Your ClarirAI frontend codebase

### Deployment Steps

#### 1. Create a Web Service on Render

1. Log in to your Render account
2. Click on the "New +" button and select "Web Service"
3. Connect your GitHub repository or use the "Deploy from existing repository" option

#### 2. Configure Your Web Service

- **Name**: `clarirai-frontend` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### 3. Add Environment Variables

Add the following environment variables:

- `NEXT_PUBLIC_API_URL`: `https://surajkumaar-clarirai.hf.space` (your Hugging Face Space URL)
- `NEXT_PUBLIC_ENVIRONMENT`: `production`

#### 4. Deploy

Click "Create Web Service" and Render will begin deploying your application.

### Alternative: Manual Deployment

If you prefer to deploy manually:

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Configure as described above

### Verifying the Deployment

Once deployed, Render will provide you with a URL for your application (e.g., `https://clarirai-frontend.onrender.com`). Visit this URL to ensure your frontend is working correctly and connecting to your Hugging Face backend.

### Troubleshooting

#### CORS Issues

If you encounter CORS issues:

1. Ensure your Hugging Face Space is properly configured to accept requests from your Render domain
2. Check that the API proxy in your Next.js application is correctly forwarding requests

#### Connection Issues

If your frontend cannot connect to the backend:

1. Verify that the `NEXT_PUBLIC_API_URL` environment variable is correctly set
2. Check that your Hugging Face Space is running and accessible
3. Examine the network requests in your browser's developer tools to identify any errors

### Updating Your Deployment

Render automatically deploys new changes when you push to your connected repository. To manually trigger a deployment:

1. Go to your Web Service in the Render dashboard
2. Click "Manual Deploy" and select "Deploy latest commit"
