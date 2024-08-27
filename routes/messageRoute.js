import express from 'express';
import { findChatThreadById } from '../models/chatThreadModel.js';

const router = express.Router();

router.get('/get-messages/:threadID', async (req, res) => {
  const { threadID } = req.params;
  const db = req.app.get('db');

  try {
    // Fetch the chat thread from the database using the provided threadID
    const chatThread = await findChatThreadById(db, threadID);
    
    if (!chatThread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Return all messages as a response
    res.status(200).json({ messages: chatThread.messages });

  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
