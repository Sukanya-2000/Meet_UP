import mongoose from 'mongoose';

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri === 'YOUR_MONGO_URI_HERE') {
    throw new Error('Set MONGO_URI in server/.env before starting the API');
  }
  const connection = await mongoose.connect(uri, { dbName: 'cybernest' });
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

export default connectDatabase;
