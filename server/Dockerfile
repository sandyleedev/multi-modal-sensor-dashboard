FROM node:24-alpine

WORKDIR /usr/src/app

# 1. Install dependencies
COPY package*.json ./
RUN npm install

# 2. Copy source code
COPY . .

# 3. Transpile TypeScript to JavaScript
RUN npx tsc

# 4. Cleanup development dependencies for a smaller image size
RUN npm prune --production

EXPOSE 4000

# 5. Execute the compiled application
CMD ["node", "dist/index.js"]