FROM node:20-alpine as builder  # ✅ Use newer Node version

WORKDIR /app

# Copy dependency files and install
COPY ./package.json ./
RUN npm install

# Copy all other source files
COPY . .

ENV VITE_OMDB_API_KEY=56b9aaf4

RUN npm run build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
