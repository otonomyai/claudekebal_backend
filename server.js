import express from 'express';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import streamRoute, { setupSocketIO } from './routes/streamRoute.js';
import tokenCountRoute from './routes/tokenCountRoute.js';
import messageRoute from './routes/messageRoute.js';
import threadRoutes from './routes/threadRoutes.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and log connection status
let db;
try {
  db = await connectDB();
  app.set('db', db);
  console.log("Successfully connected to MongoDB.");
} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "Welcome! I'm Kazuko, your friendly Koi fish AI assistant. How can I help you today?",
    image: "https://pbs.twimg.com/media/GWCP0yNX0AEaJ8b?format=png&name=small"
  });
});

// Other routes
app.use('/api', streamRoute);
app.use('/api', tokenCountRoute);
app.use('/api', messageRoute);
app.use('/api', threadRoutes);

// Setup Socket.IO with the db instance
setupSocketIO(server, db);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});