import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  // Allow CORS if necessary
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const dbClient = await clientPromise;
    const db = dbClient.db('vaidarcertodb');
    const collection = db.collection('page_views');

    if (req.method === 'GET') {
      const views = await collection.find({}).toArray();
      const viewCounts = {};
      views.forEach(v => {
        viewCounts[v.pageId] = v.count;
      });
      return res.status(200).json(viewCounts);
    } 
    
    if (req.method === 'POST') {
      const { pageId } = req.body;
      if (!pageId) return res.status(400).json({ error: 'pageId is required' });

      // Increment view count
      const result = await collection.findOneAndUpdate(
        { pageId },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      
      const newCount = result.value ? result.value.count : 1;
      return res.status(200).json({ success: true, count: newCount });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
