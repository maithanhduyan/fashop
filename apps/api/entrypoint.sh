#!/bin/sh
set -e

# Seed: chỉ chạy nếu bảng products rỗng
if [ -n "$DATABASE_URL" ] && [ -f seeds/seed_demo.sql ]; then
  COUNT=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM products" 2>/dev/null || echo "-1")
  if [ "$COUNT" = "0" ]; then
    echo "==> Seeding demo data..."
    psql "$DATABASE_URL" -f seeds/seed_demo.sql
    echo "==> Seed complete."
  else
    echo "==> Seed skipped (products count: $COUNT)"
  fi
fi

# Start server
exec ./server
