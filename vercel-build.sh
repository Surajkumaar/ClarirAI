#!/bin/bash

# Copy our special package.json for Vercel
cp package.json.vercel package.json

# Install all dependencies including dev dependencies
npm install

# Install tailwindcss explicitly
npm install tailwindcss postcss autoprefixer

# Run the build
npm run build
