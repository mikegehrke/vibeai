#!/bin/bash
echo "🔥 Killing all node processes..."
pkill -9 node
sleep 2

echo "🗑️  Deleting all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

echo "✅ Cache cleared! Starting server..."
npm run dev
