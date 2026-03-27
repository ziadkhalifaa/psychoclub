#!/bin/bash
cd /home/mostafa/psychoclub
export PORT=3000
export NODE_ENV=production
export JWT_SECRET=random_secret_123456
export DATABASE_URL="postgresql://psychouser:psychopassword123@localhost:5432/psychoclub"

echo "Starting Psychoclub Backend on Port $PORT..."
./node_modules/.bin/tsx server.ts
