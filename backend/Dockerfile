FROM node:18-alpine

# Устанавливаем зависимости для сборки native-модулей (если нужны)
RUN apk add --no-cache python3 make g++

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (чистая установка без кэша)
RUN npm install --force

# Копируем остальные файлы проекта
COPY . .

# Открываем порт (необязательно, но полезно для документации)
EXPOSE 3001

# Команда для запуска приложения
CMD ["npm", "start"]