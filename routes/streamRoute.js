import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { findUserByMac, createUser, updateUserLastThread } from '../models/userModel.js';
import { createChatThread, findChatThreadById, updateChatThread } from '../models/chatThreadModel.js';
import { streamResponse } from '../functions/streamResponse.js';
import basePrompt from '../prompts/basePrompt.js'; // Ensure this import

const router = Router();

export function setupSocketIO(server, db) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust as necessary to match your frontend's URL
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async (data) => {
      const { mac_id, ip, location, device_name, thread_id: providedThreadId, last_message } = data;

      let user = await findUserByMac(db, mac_id);
      if (!user) {
        user = await createUser(db, { mac_id, ip, location, device_name });
      }

      let thread_id = providedThreadId;
      let chatThread;
      let isNewThread = false;

      if (thread_id) {
        chatThread = await findChatThreadById(db, thread_id);
        if (!chatThread) {
          socket.emit('error', 'Thread not found');
          return;
        }
      } else {
        isNewThread = true; // Flag to indicate a new thread
        thread_id = uuidv4();
        await createChatThread(db, thread_id, user._id, []); // Create a new empty thread
        await updateUserLastThread(db, user._id, thread_id);
        chatThread = await findChatThreadById(db, thread_id);
      }

      if (isNewThread) {
        // Add the base prompt as the first message in the new thread
        chatThread.messages.push({
          role: 'user',
          content: [{ text: basePrompt }],
          timestamp: new Date(),
        });

        if (chatThread.messages.length > 0) {
            chatThread.messages[0].content[0].text += " " + last_message;
          } 
      }else{

        chatThread.messages.push({
            role: 'user',
            content: [{ text: last_message }],
            timestamp: new Date(),
          });
      }
      // Append the user's message to the first message's content
     
    

      await updateChatThread(db, chatThread._id, chatThread.messages);

      try {
        const responseStream = streamResponse(chatThread.messages);

        let responseText = '';
        for await (const chunk of responseStream) {
          responseText += chunk;
         console.log(chunk);
          socket.emit('response', { text: chunk });
        }

        chatThread.messages.push({
          role: 'assistant',
          content: [{ text: responseText }],
          timestamp: new Date(),
        });
        await updateChatThread(db, chatThread._id, chatThread.messages);

        socket.emit('done', { thread_id, updatedConversation: chatThread.messages });
        console.log("done stream" , chatThread.messages);
        await updateChatThread(db, chatThread._id, chatThread.messages);
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
