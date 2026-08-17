# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Pin npm to the version we generate package-lock.json with. node:22-alpine ships npm 10.9.3,
# and npm 10 and 11 disagree about which wasm-fallback packages belong in the lock file
# (@emnapi/runtime, @tailwindcss/oxide-wasm32-wasi/*): a lock written by one is rejected as
# "out of sync" by the other, which is exactly how a deploy broke on 2026-08-17. Keep this
# version and the one in the developers' npm in step.
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