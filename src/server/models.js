let settings = require('./settings');

let userSchema = new settings.mongoose.Schema({
    name: String,
    nickName: String,
    image: String
});

let messagesSchema = new settings.mongoose.Schema({
    messages: [{
        user: { type: settings.mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        date: String
    }]
});

exports.User = settings.mongoose.model('User', userSchema);
exports.Messages = settings.mongoose.model('messages', messagesSchema);