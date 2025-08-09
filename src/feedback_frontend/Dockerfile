# stage 1 - build react app
FROM node:18 AS build

WORKDIR /app

COPY package.json /.

RUN npm install 

COPY . .

RUN npm run build . 

# stage 2 - serve react app with nginx
FROM nginx:alpine 

RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

COPY --from=build /app/build /usr/share/nginx/html
COPY src/feedback_frontend/src/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nodeapp:nodeapp /usr/share/nginx/html

EXPOSE 80

USER nodeapp

CMD ["nginx", "-g", "daemon off;"]

