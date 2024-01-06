# Use a lightweight Node.js image based on Alpine Linux as a parent image
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock only to cache dependencies
COPY package.json yarn.lock ./

# Install application dependencies using --frozen-lockfile for reproducibility
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

# Use a multi-stage build to keep the final image lean
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Define the command to run your NestJS application
CMD ["node", "dist/main"]