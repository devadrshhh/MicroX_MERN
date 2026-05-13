const mongoose = require('mongoose');
require('dotenv').config();

const directUri = 'mongodb://devadarshb01:Devadarshb%4001@cluster0-shard-00-00.pgqa5.mongodb.net:27017,cluster0-shard-00-01.pgqa5.mongodb.net:27017,cluster0-shard-00-02.pgqa5.mongodb.net:27017/microx?ssl=true&authSource=admin';
console.log('Testing connection to:', directUri);

mongoose.connect(directUri)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err);
        process.exit(1);
    });
