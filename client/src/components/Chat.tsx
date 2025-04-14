import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3000');

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    const messageData = {
      content: newMessage,
      sender: username,
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  const handleLogout = () => {
    if (ws) {
      ws.close();
    }
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Чат ({username})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          py: 2,
          overflow: 'hidden',
        }}
      >
        <Paper
          sx={{
            flex: 1,
            mb: 2,
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.sender === username ? 'flex-end' : 'flex-start',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {message.sender}
                </Typography>
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: message.sender === username ? 'primary.main' : 'grey.200',
                    color: message.sender === username ? 'white' : 'text.primary',
                    maxWidth: '70%',
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
                <Typography variant="caption" color="text.secondary">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Введите сообщение"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={!newMessage.trim()}>
            Отправить
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Chat;