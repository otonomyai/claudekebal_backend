import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://akash:Q1091cV8TdVfFm6y@kazuko.2mjti.mongodb.net/?retryWrites=true&w=majority&appName=kazuko";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected!");
    return client.db("kazuko");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

export default connectDB;
