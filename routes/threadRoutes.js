import { Router } from 'express';
import { userIdentificationMiddleware } from '../middlewares/userIdentification.js';
import { updateUserLastThread } from '../models/userModel.js';
import { findChatThreadById } from '../models/chatThreadModel.js';

const router = Router();

// Use the userIdentificationMiddleware in all routes
router.use(userIdentificationMiddleware);

// Get All Threads
router.get('/threads', async (req, res) => {
    const db = req.app.get('db');
    const user = req.user;

    try {
        const threads = await db.collection('chat_threads')
          .find({ user_id: user._id })
          .project({ thread_id: 1, created_at: 1, updated_at: 1, 'messages.-1': 1 })
          .toArray();
    
        const formattedThreads = threads.map(thread => ({
          thread_id: thread.thread_id,
          created_at: thread.created_at,
          updated_at: thread.updated_at,
          last_message: thread.messages[thread.messages.length - 1]?.content[0]?.text || ''
        }));
    
        res.json({ threads: formattedThreads });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Thread Details
router.get('/threads/:threadId', async (req, res) => {
    const { threadId } = req.params;
    const db = req.app.get('db');
  
    try {
        const thread = await findChatThreadById(db, threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
    
        res.json(thread);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Switch Active Thread
router.post('/threads/switch', async (req, res) => {
    const { thread_id } = req.body;
    const db = req.app.get('db');
    const user = req.user;

    try {
        await updateUserLastThread(db, user._id, thread_id);
    
        res.json({
            success: true,
            message: 'Active thread switched successfully',
            thread_id
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
