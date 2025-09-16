#!/bin/bash

# Anemia Prediction Application Setup Script
# This script sets up and runs the full-stack application

echo "🏥 Anemia Prediction Application Setup"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update the values if needed."
fi

# Build and start the application
echo "🚀 Building and starting the application..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application is running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   Health Check: http://localhost:5000/api/health"
    echo ""
    echo "👤 Demo Accounts:"
    echo "   Doctor: doctor@hospital.com / doctor123"
    echo "   Patient: patient@email.com / patient123"
    echo ""
    echo "📖 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
fi
