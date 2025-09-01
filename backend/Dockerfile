FROM node:20-alpine

# Build deps for native addons like bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install deps inside the container (no host node_modules)
COPY package*.json ./
RUN npm i

# Copy the rest of the source (node_modules stays intact thanks to .dockerignore)
COPY . .

# If you want to be extra sure bcrypt is built for musl:
RUN npm rebuild bcrypt --build-from-source

# Create uploads dir & set permissions
RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 5000
CMD ["node", "server.js"]
