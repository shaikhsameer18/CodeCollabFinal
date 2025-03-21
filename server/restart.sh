#!/bin/bash
# Restart script for the server on Render

echo "Restarting server..."
npm run build
npm start 