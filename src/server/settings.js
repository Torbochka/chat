let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chat', { useNewUrlParser: true });

let db = mongoose.connection;

exports.db = db;
exports.mongoose = mongoose;