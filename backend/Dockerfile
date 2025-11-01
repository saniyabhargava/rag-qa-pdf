FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY src ./src
EXPOSE 4000
CMD ["node", "src/server.js"]
