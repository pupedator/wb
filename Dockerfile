# Use the official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Expose port (Railway will use the PORT env var dynamically)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
