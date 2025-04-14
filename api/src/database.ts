import sqlite3 from 'sqlite3';
import { Database, RunResult } from 'sqlite3';

let db: Database;

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export const setupDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./chat.db', (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Создание таблицы пользователей
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }

        // Создание таблицы сообщений
        db.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users (id)
          )
        `, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  });
};

// Функции для работы с пользователями
export const createUser = (username: string, password: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password],
      function(this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
};

export const getUserByUsername = (username: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err: Error | null, row: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      }
    );
  });
};

// Функции для работы с сообщениями
export const saveMessage = (senderId: number, content: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO messages (sender_id, content) VALUES (?, ?)',
      [senderId, content],
      function(this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
};

export const getRecentMessages = (limit: number = 50): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT ?',
      [limit],
      (err: Error | null, rows: Message[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
};