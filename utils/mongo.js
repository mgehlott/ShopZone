const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'store';

async function dbConnect() {

    const result = await client.connect();
    const db = result.db(dbName);
    const collection = db.collection('products');
    return collection;
}

module.exports = dbConnect;