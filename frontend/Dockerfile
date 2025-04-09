FROM nginx:alpine

# Копируем все фронтенд-файлы
COPY ./src /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Для production-сборки можно добавить:
# RUN apk add --no-cache bash
# RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80