# Dockerfile for NerveLess backend
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build step: no build required for backend, ensure entrypoint
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/app.js"]
