#!/usr/bin/env bash
# Deploy medicinewithin.nl to production.
#
# --archive=tgz is required: the default per-file upload fails against Vercel's
# API on this project. .vercelignore keeps the payload to the site itself.
set -euo pipefail
cd "$(dirname "$0")"

echo "Deploying to production..."
npx --no-install vercel --prod --yes --archive=tgz

echo
echo "Checking the live site..."
for p in "/" "/offerings/living-temple.html" "/offerings/temple-work.html"; do
  code=$(curl -s --max-time 15 -o /dev/null -w "%{http_code}" "https://medicinewithin.nl$p")
  printf "  %-40s %s\n" "$p" "$code"
done
echo
echo "Live: https://medicinewithin.nl"
