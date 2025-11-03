# Use the official Node.js image as the base
FROM node:20.9.0

# Set the working directory in the container
WORKDIR /app

# Set environment variables to skip Puppeteer Chrome download
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROME_DOWNLOAD=true

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --force || npm install --force

# Copy the entire project to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Expose the desired port (default is 3000 for Next.js)
EXPOSE 3001     

# Set environment variable for the port
ENV PORT=3001

# Start the application
CMD ["npm", "start"]