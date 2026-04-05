FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]
