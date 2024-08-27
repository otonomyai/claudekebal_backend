import { ObjectId } from 'mongodb';

export function createChatThread(db, threadId, userId, messages = []) {
  const chatThreadsCollection = db.collection('chat_threads');
  return chatThreadsCollection.insertOne({
    thread_id: threadId,
    user_id: new ObjectId(userId), // Use 'new' with ObjectId
    messages: messages,
    created_at: new Date(),
    updated_at: new Date(),
  });
}

export function findChatThreadById(db, threadId) {
  const chatThreadsCollection = db.collection('chat_threads');
  return chatThreadsCollection.findOne({ thread_id: threadId });
}

export function updateChatThread(db, threadId, messages) {
  const chatThreadsCollection = db.collection('chat_threads');
  return chatThreadsCollection.updateOne(
    { _id: new ObjectId(threadId) }, // Use 'new' with ObjectId
    { $set: { messages: messages, updated_at: new Date() } }
  );
}
