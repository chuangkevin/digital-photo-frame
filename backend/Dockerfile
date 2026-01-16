FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create directories for uploads and database
RUN mkdir -p uploads/media uploads/thumbnails data

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]