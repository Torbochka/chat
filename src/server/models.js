let settings = require('./settings');

let userSchema = new settings.mongoose.Schema({
    name: String,
    nickName: String,
});

let messagesSchema = new settings.mongoose.Schema({
    messages: [{
        image: String,
        name: String,
        message: String
    }]
});

exports.User = settings.mongoose.model('user', userSchema);
exports.Messages = settings.mongoose.model('messages', messagesSchema);