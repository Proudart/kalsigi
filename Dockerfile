# Use the official Bun image as the base
FROM oven/bun:1

# Set the working directory in the container
WORKDIR /app

# Set environment variables to skip Puppeteer Chrome download
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROME_DOWNLOAD=true

# Copy package.json and bun.lock to the working directory
COPY package.json bun.lock ./

# Install all dependencies for build
RUN bun install --frozen-lockfile

# Copy and build
COPY . .
RUN bun run build

# Clean node_modules and reinstall only production deps
RUN rm -rf node_modules && bun install --production

# Expose the desired port (default is 3000 for Next.js)
EXPOSE 3001     

# Set environment variable for the port
ENV PORT=3001

# Start the application
CMD ["bun", "run", "start"]