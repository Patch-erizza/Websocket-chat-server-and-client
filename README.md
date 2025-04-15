# WebSocket Chat Application

## Че это такое:

Разбиралась с WebSocket, решила нафигачить минимальный дефолтный чатик, без комнат и всего такого. Клиент на React и Material UI, самая базовая JWT аутетификация. Бэк на Node.js, Express и SQlite в качестве БД чтобы не заморачиваться.)

### По клиенту:
- React 18
- TypeScript
- Material UI
- React Router
- Axios для HTTP-запросов
- Vite в качестве сборщика

### По бэку:
- Node.js с Express
- WebSocket (ws)
- JWT для аутентификации
- SQLite для хранения данных
- встроенный bcrypt для хеширования паролей
- тоже естественно TypeScript

## Установка и запуск

### Предварительные требования
- Нода 14 и выше
- npm 6+

### Ставим пакетики
:

```bash
npm run install:all
```
### Запускаемся

```bash
npm run dev
```

### Сборка в прод

```bash
# клиент
cd client && npm run build

# бэк
cd api && npm run build
```
## И че как этим пользоваться?

1. Регаешься или логинишься
2. Печатаешь свой месселд в чатик
3. ...
3. PROFIT!