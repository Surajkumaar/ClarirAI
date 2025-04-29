#!/bin/bash

# Remove any existing pnpm-lock.yaml to avoid package manager conflicts
if [ -f "pnpm-lock.yaml" ]; then
  rm pnpm-lock.yaml
fi

# Install all dependencies including TypeScript and type definitions
npm install

# Explicitly install TypeScript and related packages
npm install typescript @types/react @types/react-dom @types/node --no-save

# Install tailwindcss explicitly
npm install tailwindcss postcss autoprefixer

# Create tsconfig.json if it doesn't exist
if [ ! -f "tsconfig.json" ]; then
  echo '{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}' > tsconfig.json
fi

# Run the build
npm run build
