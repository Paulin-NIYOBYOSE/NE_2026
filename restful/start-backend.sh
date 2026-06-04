#!/bin/bash

# Fire Extinguisher Management System — Backend Startup Script
# Starts all 8 microservices using compiled dist output

set -e

BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"

echo "=========================================="
echo "  TZW LTD — Backend Services Startup"
echo "=========================================="
echo ""

# ── Infrastructure checks ──────────────────────────────────────────────────────
echo "Checking PostgreSQL..."
if ! pg_isready -U postgres -q 2>/dev/null && ! pg_isready -q 2>/dev/null; then
    echo "  ERROR: PostgreSQL is not running."
    echo "  Start it:  sudo systemctl start postgresql"
    exit 1
fi
echo "  ✓ PostgreSQL OK"

echo "Checking RabbitMQ..."
if ! curl -s -o /dev/null http://localhost:15672 2>/dev/null; then
    echo "  WARNING: RabbitMQ not detected — attempting to start..."
    sudo systemctl start rabbitmq-server 2>/dev/null || true
    sleep 3
fi
if ! curl -s -o /dev/null http://localhost:15672 2>/dev/null; then
    echo "  ERROR: RabbitMQ is not running."
    echo "  Start it:  sudo systemctl start rabbitmq-server"
    exit 1
fi
echo "  ✓ RabbitMQ OK"
echo ""

# ── Kill any stale processes on service ports ──────────────────────────────────
echo "Cleaning up old processes on ports 5000–5007..."
for port in 5000 5001 5002 5003 5004 5005 5006 5007; do
    pid=$(lsof -t -i :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        kill -9 "$pid" 2>/dev/null || true
        echo "  Killed PID $pid on port $port"
    fi
done
sleep 1
echo ""

# ── Helper: start one service ─────────────────────────────────────────────────
start_service() {
    local name="$1"
    local port="$2"
    local dir="$3"

    if [ ! -f "$dir/dist/main.js" ]; then
        echo "  [$name] dist/main.js not found — building..."
        (cd "$dir" && npm run build > /dev/null 2>&1) || {
            echo "  ERROR: Build failed for $name"
            exit 1
        }
    fi

    echo "Starting $name on port $port..."
    nohup node "$dir/dist/main.js" >> "$dir/service.log" 2>&1 &
    echo "  PID $! → $dir/service.log"
}

# ── Start microservices (gateway last) ────────────────────────────────────────
start_service "Auth Service"          5001 "$BACKEND_DIR/auth-service"
start_service "User Service"          5002 "$BACKEND_DIR/user-service"
start_service "Extinguisher Service"  5003 "$BACKEND_DIR/extinguisher-service"
start_service "Inspection Service"    5004 "$BACKEND_DIR/inspection-service"
start_service "Maintenance Service"   5005 "$BACKEND_DIR/maintenance-service"
start_service "Reporting Service"     5006 "$BACKEND_DIR/reporting-service"
start_service "Notification Service"  5007 "$BACKEND_DIR/notification-service"

echo ""
echo "Waiting 4 s for services to initialize..."
sleep 4

start_service "API Gateway"           5000 "$BACKEND_DIR/api-gateway"

echo ""
echo "Waiting 3 s for gateway to connect..."
sleep 3

# ── Health check ──────────────────────────────────────────────────────────────
echo ""
echo "Service status:"
names=("API Gateway" "Auth" "User" "Extinguisher" "Inspection" "Maintenance" "Reporting" "Notification")
ports=(5000 5001 5002 5003 5004 5005 5006 5007)

for i in "${!ports[@]}"; do
    port="${ports[$i]}"
    name="${names[$i]}"
    code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/api/docs" 2>/dev/null || echo "000")
    if [ "$code" = "200" ]; then
        echo "  ✓ $name        → http://localhost:$port"
    else
        echo "  ⚠ $name        → port $port (HTTP $code — still starting)"
    fi
done

echo ""
echo "=========================================="
echo "  All services running!"
echo "=========================================="
echo ""
echo "  Swagger docs:"
echo "    API Gateway:  http://localhost:5000/api/docs"
echo "    Auth:         http://localhost:5001/api/docs"
echo "    User:         http://localhost:5002/api/docs"
echo "    Extinguisher: http://localhost:5003/api/docs"
echo "    Inspection:   http://localhost:5004/api/docs"
echo "    Maintenance:  http://localhost:5005/api/docs"
echo "    Reporting:    http://localhost:5006/api/docs"
echo "    Notification: http://localhost:5007/api/docs"
echo ""
echo "  RabbitMQ UI:  http://localhost:15672  (guest / guest)"
echo ""
echo "  Frontend dev:"
echo "    cd frontend && npm run dev    (http://localhost:3000)"
echo ""
echo "  Stop all services:"
echo "    pkill -f 'node.*dist/main.js'"
echo ""
