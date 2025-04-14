import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import { config } from 'dotenv';
import { setupDatabase } from './database';
import authRoutes from './routes/auth';

// Загрузка переменных окружения
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты аутентификации
app.use('/api/auth', authRoutes);

// Создание HTTP сервера
const server = createServer(app);

// Инициализация WebSocket сервера
const wss = new WebSocketServer({ server });

// Обработка WebSocket подключений
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
    const parsedMessage =  JSON.parse(message);
    // console.log("MESSAGE", JSON.parse(message))
    // Рассылка сообщения всем клиентам
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Инициализация базы данных и запуск сервера
setupDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });