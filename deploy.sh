#!/bin/bash

echo "🚀 Deploying CampusX to AWS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

echo "📦 Building Docker images..."

# Build and tag images
docker build -t campusx-backend:latest ./backend
docker build -t campusx-frontend:latest ./frontend

echo "🏷️ Tagging images for AWS ECR..."

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Tag images for ECR
docker tag campusx-backend:latest $ECR_REGISTRY/campusx-backend:latest
docker tag campusx-frontend:latest $ECR_REGISTRY/campusx-frontend:latest

echo "🔐 Logging into AWS ECR..."

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

echo "📤 Pushing images to ECR..."

# Create repositories if they don't exist
aws ecr create-repository --repository-name campusx-backend --region $AWS_REGION || true
aws ecr create-repository --repository-name campusx-frontend --region $AWS_REGION || true

# Push images
docker push $ECR_REGISTRY/campusx-backend:latest
docker push $ECR_REGISTRY/campusx-frontend:latest

echo "🔧 Creating ECS task definition..."

# Create task definition JSON
cat > task-definition.json <<EOF
{
  "family": "campusx",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "$ECR_REGISTRY/campusx-backend:latest",
      "portMappings": [
        {
          "containerPort": 5001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5001"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:campusx/mongodb-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:campusx/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/campusx",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "$ECR_REGISTRY/campusx-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "dependsOn": [
        {
          "containerName": "backend",
          "condition": "START"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/campusx",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

echo "📋 Registering task definition..."

# Register task definition
TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://task-definition.json --query taskDefinitionArn --output text)

echo "🌐 Updating ECS service..."

# Update service (assuming service exists)
aws ecs update-service --cluster campusx --service campusx-service --task-definition $TASK_DEF_ARN || true

echo "✅ Deployment completed successfully!"
echo "🌍 Your application should be available at your load balancer URL."
echo "📊 Check the ECS console for status updates."
