let mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/chat', { useNewUrlParser: true });
mongoose.connect('mongodb+srv://user:user@cluster0-ofsf7.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });

let db = mongoose.connection;

exports.db = db;
exports.mongoose = mongoose;