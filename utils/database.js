const { MongoClient } = require('mongodb');

let _db;
const mongoConnect = async () => {

    const client = await MongoClient.connect('mongodb+srv://mgehlott:849551026@cluster0.s0hwb.mongodb.net/shop?retryWrites=true&w=majority');

    _db = client.db();

    // MongoClient.connect('mongodb+srv://mgehlott:849551026@cluster0.s0hwb.mongodb.net/?retryWrites=true&w=majority')
    //     .then(client => {
    //         console.log('Connected!!!');
    //         callback(client);
    //     })
    //     .catch(err => {
    //         console.log("there is error in connection");
    //     });

}

const getDb = () => {
    if (_db)
        return _db;
    throw 'no database found !!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;





