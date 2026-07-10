#!/bin/sh
set -eu

echo "Running ServicePro PostgreSQL migrations..."
npm run migrate

echo "Seeding auth..."
npm run seed:auth || true

echo "Seeding services..."
npm run seed:services || true

echo "Bootstrap complete."
