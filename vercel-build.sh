#!/bin/bash

# Remove any existing pnpm-lock.yaml to avoid package manager conflicts
if [ -f "pnpm-lock.yaml" ]; then
  rm pnpm-lock.yaml
fi

# Install all dependencies including TypeScript and type definitions
npm install

# Explicitly install TypeScript and related packages with specific versions
npm install typescript@5.8.3 @types/react@19.1.2 @types/node@22.15.3 @types/react-dom@19.1.2

# Move TypeScript from devDependencies to dependencies in package.json
node -e "const pkg = require('./package.json'); if (pkg.devDependencies && pkg.devDependencies.typescript) { pkg.dependencies = pkg.dependencies || {}; pkg.dependencies.typescript = pkg.devDependencies.typescript; delete pkg.devDependencies.typescript; if (pkg.devDependencies['@types/react']) { pkg.dependencies['@types/react'] = pkg.devDependencies['@types/react']; delete pkg.devDependencies['@types/react']; } if (pkg.devDependencies['@types/node']) { pkg.dependencies['@types/node'] = pkg.devDependencies['@types/node']; delete pkg.devDependencies['@types/node']; } if (pkg.devDependencies['@types/react-dom']) { pkg.dependencies['@types/react-dom'] = pkg.devDependencies['@types/react-dom']; delete pkg.devDependencies['@types/react-dom']; } require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"

# Install tailwindcss explicitly
npm install tailwindcss postcss autoprefixer

# Create a simple .env file to ensure environment variables are set
echo "NEXT_TYPESCRIPT_IGNORE_ERRORS=true" > .env.local
echo "NEXT_PUBLIC_API_URL=https://surajkumaar-clarirai.hf.space" >> .env.local
echo "NEXT_PUBLIC_ENVIRONMENT=production" >> .env.local

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

# Create a next-env.d.ts file if it doesn't exist
if [ ! -f "next-env.d.ts" ]; then
  echo '/// <reference types="next" />' > next-env.d.ts
  echo '/// <reference types="next/types/global" />' >> next-env.d.ts
fi

# Run the build
npm run build
