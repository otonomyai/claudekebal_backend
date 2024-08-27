import { ObjectId } from 'mongodb';

export async function createUser(db, userData) {
  const usersCollection = db.collection('users');
  return usersCollection.insertOne({
    mac_id: userData.mac_id,
    ip: userData.ip,
    location: userData.location,
    device_name: userData.device_name,
    username: userData.username || 'akash',  // Placeholder username
    last_thread_id: null,  // To store the last used thread ID
    chat_threads: [],
    created_at: new Date(),
    updated_at: new Date(),
  });
}

export function findUserByMac(db, mac_id) {
  const usersCollection = db.collection('users');
  return usersCollection.findOne({ mac_id });
}

export function updateUserLastThread(db, userId, threadId) {
  const usersCollection = db.collection('users');
  return usersCollection.updateOne(
    { _id: new ObjectId(userId) }, // Use 'new' with ObjectId
    { $set: { last_thread_id: threadId, updated_at: new Date() } }
  );
}
