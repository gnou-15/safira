FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Default environment variables
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
