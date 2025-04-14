import { Router } from 'express';
import { createUser, getUserByUsername } from '../database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка наличия обязательных полей
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Проверка существования пользователя
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const userId = await createUser(username, hashedPassword);

    // Создание JWT токена
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка наличия обязательных полей
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Поиск пользователя
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;