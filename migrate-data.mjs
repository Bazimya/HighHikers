import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function migrateData() {
  let localClient, atlasClient;
  
  try {
    console.log('🔄 Starting data migration...\n');
    
    // Connect to local MongoDB
    console.log('📍 Connecting to local MongoDB (localhost:27017)...');
    localClient = new MongoClient('mongodb://localhost:27017');
    await localClient.connect();
    console.log('✅ Connected to local MongoDB\n');
    
    // Connect to MongoDB Atlas
    console.log('☁️  Connecting to MongoDB Atlas...');
    atlasClient = new MongoClient(process.env.MONGODB_URI);
    await atlasClient.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get databases
    const localDb = localClient.db('high-hikers');
    const atlasDb = atlasClient.db('high-hikers');
    
    // Get all collections from local MongoDB
    const collections = await localDb.listCollections().toArray();
    
    console.log(`📦 Found ${collections.length} collections to migrate:\n`);
    
    let totalDocuments = 0;
    
    // Migrate each collection
    for (const collInfo of collections) {
      const collectionName = collInfo.name;
      
      // Skip system collections
      if (collectionName.startsWith('system.')) {
        continue;
      }
      
      const sourceCollection = localDb.collection(collectionName);
      const targetCollection = atlasDb.collection(collectionName);
      
      // Get documents count
      const count = await sourceCollection.countDocuments();
      
      if (count === 0) {
        console.log(`⏭️  Skipped: ${collectionName} (empty)`);
        continue;
      }
      
      // Drop existing collection in Atlas (for clean migration)
      try {
        await targetCollection.drop();
      } catch (e) {
        // Collection might not exist yet
      }
      
      // Get all documents
      const documents = await sourceCollection.find({}).toArray();
      
      if (documents.length > 0) {
        // Insert into Atlas
        await targetCollection.insertMany(documents);
        console.log(`✅ Migrated: ${collectionName} (${count} documents)`);
        totalDocuments += count;
      }
    }
    
    console.log(`\n✨ Migration complete! Total documents migrated: ${totalDocuments}\n`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
  }
}

migrateData();
