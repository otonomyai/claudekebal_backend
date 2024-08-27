import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { findUserByMac, createUser, updateUserLastThread } from '../models/userModel.js';
import { createChatThread, findChatThreadById, updateChatThread } from '../models/chatThreadModel.js';
import { streamResponse } from '../functions/streamResponse.js';

const router = Router();

export function setupSocketIO(server, db) { // Pass the db instance here
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust as necessary to match your frontend's URL
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async (data) => {
      const { mac_id, ip, location, device_name, thread_id: providedThreadId, last_message } = data;

      // Use the passed db instance directly
      let user = await findUserByMac(db, mac_id);
      if (!user) {
        user = await createUser(db, { mac_id, ip, location, device_name });
      }

      let thread_id = providedThreadId;
      let chatThread;

      if (thread_id) {
        chatThread = await findChatThreadById(db, thread_id);
        if (!chatThread) {
          socket.emit('error', 'Thread not found');
          return;
        }
      } else {
        thread_id = uuidv4();
        await createChatThread(db, thread_id, user._id, []); // Create a new empty thread
        await updateUserLastThread(db, user._id, thread_id);
        chatThread = await findChatThreadById(db, thread_id);
      }

      chatThread.messages.push({
        role: 'user',
        content: [{ text: last_message }],
        timestamp: new Date(),
      });
      await updateChatThread(db, chatThread._id, chatThread.messages);

      try {
        const responseStream = streamResponse(chatThread.messages);

        let responseText = '';
        for await (const chunk of responseStream) {
          responseText += chunk;
         
          socket.emit('response', { text: chunk });
        }

        chatThread.messages.push({
          role: 'assistant',
          content: [{ text: responseText }],
          timestamp: new Date(),
        });
        await updateChatThread(db, chatThread._id, chatThread.messages);

        socket.emit('done', { thread_id, updatedConversation: chatThread.messages });
      } catch (err) {
        console.error('Streaming error:', err);
        socket.emit('error', 'Failed to process the streaming request.');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

export default router;
