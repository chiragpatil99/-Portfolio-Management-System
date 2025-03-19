
# Author: Pranav Pawar
# Description: nginx dockerfile

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
