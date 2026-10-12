FROM node:24-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist/tienda-perritos-angular/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
