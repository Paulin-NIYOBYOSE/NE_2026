#!/bin/bash

echo "Stopping all project services..."
pkill -f "node dist/main.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
for port in 5000 5001 5002 5003 5004 5005 5006 5007 3000 3001 3002; do
    pid=$(lsof -t -i :$port 2>/dev/null)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null
    fi
done
echo "All services stopped."
