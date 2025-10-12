# Use the official Node.js image as the base
FROM node:20.3.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm i --force

# Copy the entire project to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the desired port (default is 3000 for Next.js)
EXPOSE 3001     

# Set environment variable for the port
ENV PORT=3001

# Start the application
CMD ["npm", "start"]