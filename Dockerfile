# Use a lightweight Node.js image based on Alpine Linux as a parent image
FROM node:21-alpine3.18 as builder

ENV YARN_VERSION=4.0.1

# update dependencies, add libc6-compat and dumb-init to the base image
RUN apk update && apk upgrade && apk add --no-cache libc6-compat && apk add dumb-init

# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock only to cache dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install application dependencies using --frozen-lockfile for reproducibility
RUN yarn install --immutable

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build core
RUN yarn build scheduler
RUN yarn build bg-tasks

# Use a multi-stage build to keep the final image lean
FROM node:21-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder package.json yarn.lock .yarnrc.yml ./
COPY --from=builder .yarn ./.yarn

# Install only production dependencies
RUN yarn install --immutable
