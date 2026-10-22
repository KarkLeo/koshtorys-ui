# ---- Build stage ----
FROM node:24-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

# node:24-alpine already ships npm 11, so this pin no longer bridges the npm 10-vs-11 lockfile
# split that broke the deploy on 2026-08-17 (npm 10 and 11 disagree about the wasm-fallback
# packages @emnapi/runtime and @tailwindcss/oxide-wasm32-wasi/*). It is about reproducibility:
# an exact npm version keeps builds identical across machines and future base-image bumps.
RUN npm i -g npm@11.6.2

ARG VITE_API_ENDPOINT
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT

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