$ErrorActionPreference = "Stop"

Write-Host "Running ServicePro PostgreSQL migrations..."
npm run migrate

Write-Host "Seeding auth..."
try { npm run seed:auth } catch { Write-Warning "seed:auth failed or already exists" }

Write-Host "Seeding services..."
try { npm run seed:services } catch { Write-Warning "seed:services failed or already exists" }

Write-Host "Bootstrap complete."
