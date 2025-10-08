# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

ARG VITE_GRAPHQL_ENDPOINT
ENV VITE_GRAPHQL_ENDPOINT=$VITE_GRAPHQL_ENDPOINT


COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]