Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm run setup
npm run dev
