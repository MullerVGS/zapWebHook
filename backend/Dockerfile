FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Create .env file if it doesn't exist
RUN touch .env

# Expose port
EXPOSE 3001

# Development command
CMD ["npm", "run", "dev"]
