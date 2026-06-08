const mongoose = require('mongoose');
const dns = require('dns');

// Fix: Node.js default DNS may fail SRV lookups on some networks (e.g. IPv6-only).
// Use Google Public DNS as a reliable fallback for Atlas SRV resolution.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  const envUri = process.env.MONGO_URI;
  const uri = envUri || 'mongodb://127.0.0.1:27017/hawleek';
  const localUri = 'mongodb://127.0.0.1:27017/hawleek';
  const isAtlas = uri.includes('+srv') || uri.includes('mongodb.net');

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: isAtlas ? 30000 : 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: isAtlas ? 30000 : 10000,
  };

  // Only set dbName if it's not already in the URI path
  if (!uri.match(/\.net\/[a-zA-Z]/)) {
    options.dbName = 'hawleek';
  }

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`✅ MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
    return;
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);

    if (isAtlas && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Atlas connection failed; attempting local MongoDB fallback.');
      try {
        const conn = await mongoose.connect(localUri, { ...options, serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
        console.log(`✅ Local MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
        return;
      } catch (localErr) {
        console.error(`❌ Local MongoDB fallback failed: ${localErr.message}`);
      }
    }

    console.error('Please ensure MongoDB is running and MONGO_URI is correct.');
    process.exit(1);
  }
};

module.exports = connectDB;
