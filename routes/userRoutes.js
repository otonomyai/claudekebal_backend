import express from 'express';
import { createChatThread, findChatThreadById, updateChatThread } from '../models/chatThreadModel';
import { updateUserLastThread } from '../models/userModel';
import { userIdentificationMiddleware } from '../middlewares/userIdentification';

const router = express.Router();

// Middleware to identify the user
router.use(userIdentificationMiddleware);

// Route to create a new chat thread
router.post('/threads', async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user._id;
    const threadId = new ObjectId().toString(); // Generate a new thread ID
    const messages = req.body.messages || [];

    const thread = await createChatThread(db, threadId, userId, messages);

    await updateUserLastThread(db, userId, threadId);

    res.status(201).json({ threadId: thread.insertedId, messages });
});

// Route to get a chat thread by ID
router.get('/threads/:threadId', async (req, res) => {
    const db = req.app.locals.db;
    const threadId = req.params.threadId;

    const thread = await findChatThreadById(db, threadId);

    if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);
});

// Route to update a chat thread
router.put('/threads/:threadId', async (req, res) => {
    const db = req.app.locals.db;
    const threadId = req.params.threadId;
    const messages = req.body.messages || [];

    const result = await updateChatThread(db, threadId, messages);

    if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Thread not found or no changes made' });
    }

    res.json({ success: true });
});

export default router;
