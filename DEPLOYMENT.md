# 🚀 Руководство по развертыванию платформы PipePrime в Production

Данный документ содержит полное пошаговое руководство по развертыванию промышленной B2B-платформы **PipePrime** на production-серверах (VPS / выделенные серверы / облачные провайдеры Selectel, Timeweb, VK Cloud, Yandex Cloud и др.).

---

## 🏗️ Архитектура платформы

- **Frontend:** Современный интерфейс на Vanilla HTML5 / CSS3 / ES6 (без тяжелых внешних фреймворков, мгновенный First Contentful Paint < 0.3s).
- **Backend API:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12) с асинхронной обработкой запросов и Uvicorn ASGI.
- **База данных:** SQLite 3 в режиме WAL (Write-Ahead Logging) с автоинициализацией таблиц `leads`, `lead_items`, `atr_tokens`.
- **Генерация КП в PDF:** ReportLab (генерация официальных коммерческих предложений с реквизитами, таблицами и весом партии).
- **Защита IP (АТР 2026):** Закрытое корпоративное хранилище с отдачей по одноразовым криптографическим токенам с ограничением по времени (24ч).
- **Интеграция:** Моментальные уведомления менеджеров в Telegram через Bot API + логирование.

---

## 📋 Системные требования

- **ОС:** Ubuntu 22.04 / 24.04 LTS или Debian 12 (рекомендуется)
- **CPU / RAM:** от 1 vCPU, от 1–2 GB RAM
- **Диск:** от 10 GB SSD/NVMe
- **Сеть:** Публичный IPv4-адрес, открытые порты `80` (HTTP) и `443` (HTTPS)
- **Домен:** Привязанные A-записи домена (например, `pipeprime.ru` и `www.pipeprime.ru`) к IP-адресу сервера

---

## 🐳 Вариант 1: Быстрый запуск через Docker & Docker Compose (Рекомендуется)

Самый надежный и изолированный способ запуска со встроенной ротацией логов и healthcheck.

### Шаг 1. Установка Docker на сервер
Если Docker еще не установлен:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Для применения группы перезайдите по SSH
```

### Шаг 2. Клонирование репозитория
```bash
sudo mkdir -p /var/www/pipeprime
sudo chown $USER:$USER /var/www/pipeprime
git clone https://github.com/LIDERWAR/pipeprime.git /var/www/pipeprime
cd /var/www/pipeprime
```

### Шаг 3. Настройка переменных окружения
Скопируйте пример файла конфигурации:
```bash
cp server/.env.example server/.env
nano server/.env
```

Заполните параметры:
```env
# Сервер
HOST=0.0.0.0
PORT=8000
SECRET_KEY=сгенерируйте_случайную_длинную_строку_для_безопасности

# Telegram-бот для приема лидов и спецификаций
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_CHAT_ID=-1001234567890

# CORS (для продакшна укажите ваш домен)
CORS_ORIGINS=https://pipeprime.ru,https://www.pipeprime.ru
```

### Шаг 4. Запуск контейнера
```bash
docker compose up -d --build
```

Проверить статус контейнера и healthcheck:
```bash
docker compose ps
curl http://localhost:8000/api/health
```

Ответ должен быть:
```json
{"status":"healthy","service":"PipePrime API","version":"1.0.0","timestamp":"..."}
```

### Шаг 5. Настройка Nginx с SSL (HTTPS)
Скопируйте конфигурацию Nginx:
```bash
sudo cp deploy/nginx/pipeprime.conf /etc/nginx/sites-available/pipeprime.conf
sudo ln -s /etc/nginx/sites-available/pipeprime.conf /etc/nginx/sites-enabled/
```

Получите бесплатный SSL-сертификат Let's Encrypt через Certbot:
```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pipeprime.ru -d www.pipeprime.ru
sudo nginx -t && sudo systemctl reload nginx
```

---

## ⚙️ Вариант 2: Запуск без Docker (Systemd + Python venv)

### Шаг 1. Установка системных зависимостей
```bash
sudo apt update && sudo apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git curl
```

### Шаг 2. Клонирование и настройка виртуального окружения
```bash
sudo mkdir -p /var/www/pipeprime
sudo chown -R www-data:www-data /var/www/pipeprime
sudo -u www-data git clone https://github.com/LIDERWAR/pipeprime.git /var/www/pipeprime
cd /var/www/pipeprime

# Создание venv и установка библиотек
sudo -u www-data python3 -m venv venv
sudo -u www-data ./venv/bin/pip install --upgrade pip
sudo -u www-data ./venv/bin/pip install -r server/requirements.txt
```

### Шаг 3. Конфигурация окружения
```bash
sudo -u www-data cp server/.env.example server/.env
sudo nano server/.env
```

### Шаг 4. Регистрация Systemd службы
```bash
sudo cp deploy/pipeprime.service /etc/systemd/system/pipeprime.service
sudo systemctl daemon-reload
sudo systemctl enable pipeprime.service
sudo systemctl start pipeprime.service
sudo systemctl status pipeprime.service
```

---

## 🔒 Защита интеллектуальной собственности (АТР 2026)

Файл **Альбома технических решений (АТР 2026)** размещается исключительно в защищенной директории:
`/var/www/pipeprime/server/storage/protected/Boilerberg_ATR_2026.pdf`

- Прямой доступ к нему через веб-сервер и статику **заблокирован**.
- Доступ возможен **только** по валидному одноразовому токену доступа через эндпоинт `/api/atr/download/{token}`.
- Токен генерируется сервером после подтверждения заявки проектной организации (ИНН + Компания) и действует 24 часа.

---

## 🔄 Обновление проекта (CI / CD)

Для применения обновлений с GitHub на сервере достаточно выполнить подготовленный скрипт:

```bash
# При использовании Docker
./deploy/deploy.sh docker

# При использовании Systemd
./deploy/deploy.sh systemd
```

Скрипт автоматически:
1. Загрузит свежий код из ветки `main`.
2. Проверит наличие конфигурации `.env`.
3. Пересоберет контейнеры или обновит зависимости `pip`.
4. Перезапустит службу и проверит `/api/health`.

---

## 💾 Резервное копирование (Backup)

Для сохранения базы лидов и загруженных смет создайте ежедневный cron:
```bash
crontab -e
```
Добавьте строку:
```bash
0 3 * * * tar -czf /var/backups/pipeprime_$(date +\%Y\%m\%d).tar.gz /var/www/pipeprime/server/data /var/www/pipeprime/server/storage
```
