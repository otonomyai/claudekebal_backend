import express from 'express';
import cors from 'cors';
import http from 'http'; // Import the HTTP module
import connectDB from './config/db.js';
import streamRoute, { setupSocketIO } from './routes/streamRoute.js';
import tokenCountRoute from './routes/tokenCountRoute.js'; // Adjust the path as necessary
import messageRoute from './routes/messageRoute.js'; // Adjust the path as necessary
import threadRoutes from './routes/threadRoutes.js';


// d6fffe6c-698f-4e1c-bb1b-c9290213a045

const app = express();
const server = http.createServer(app); // Create an HTTP server

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
  process.exit(1); // Exit the process if the connection fails
}

// Routes
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
