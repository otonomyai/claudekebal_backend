import express from 'express';
import { findChatThreadById } from '../models/chatThreadModel.js';
import { encode } from 'gpt-tokenizer';

const router = express.Router();

router.get('/count-tokens/:threadID', async (req, res) => {
  const { threadID } = req.params;
  const db = req.app.get('db');

  try {
    // Fetch the chat thread from the database using the provided threadID
    const chatThread = await findChatThreadById(db, threadID);
    
    if (!chatThread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Concatenate all content fields into a single string
    const allContent = chatThread.messages.map(msg => msg.content.map(c => c.text).join(' ')).join(' ');

    // Encode the entire content string to count the tokens
    const tokens = encode(allContent);

    // Return the number of tokens as the response
    res.status(200).json({ tokenCount: tokens.length });

  } catch (err) {
    console.error('Error counting tokens:', err);
    res.status(500).json({ error: 'Failed to count tokens' });
  }
});

export default router;
