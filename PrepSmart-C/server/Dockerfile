FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]






