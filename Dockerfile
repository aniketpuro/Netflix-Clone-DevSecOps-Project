FROM node:16.17.0-alpine as builder

WORKDIR /app

# Copy dependency files and install
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install

# Copy all other source files
COPY . .

# Set OMDb API key as an environment variable (Vite expects VITE_ prefix)
ENV VITE_OMDB_API_KEY=56b9aaf4

# Build the frontend app
RUN yarn build

# Serve with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Clean default HTML directory
RUN rm -rf ./*

# Copy build output
COPY --from=builder /app/dist .

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
