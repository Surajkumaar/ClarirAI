#!/bin/bash

# Install all dependencies including dev dependencies
npm install

# Install tailwindcss explicitly
npm install tailwindcss postcss autoprefixer

# Run the build
npm run build
