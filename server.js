import express from 'express';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import streamRoute, { setupSocketIO } from './routes/streamRoute.js';
import tokenCountRoute from './routes/tokenCountRoute.js';
import messageRoute from './routes/messageRoute.js';
import threadRoutes from './routes/threadRoutes.js';
import repoRoutes from './routes/repoRoutes.js'
import { userIdentificationMiddleware } from './middlewares/userIdentification.js';



import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  secretKey: "sk-lf-707b89c6-7220-4c66-98f0-9eced8f81d72",
  publicKey: "pk-lf-c369ef8b-ced6-4ebe-b2c9-c1fb778f2f10",
  baseUrl: "https://cloud.langfuse.com"
});



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
app.use(userIdentificationMiddleware);

app.use('/api', streamRoute);
app.use('/api', tokenCountRoute);
app.use('/api', messageRoute);
app.use('/api', threadRoutes);

app.use('/api/repo', repoRoutes);




// Setup Socket.IO with the db instance
setupSocketIO(server, db);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});