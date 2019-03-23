let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const models = require('./models');
const userList = new Map();

app.set('view engine', 'hbs');
app.set('views', 'src');
app.get('/', (req, res) => res.render('index.hbs'));

io.on('connection', socket => {
    socket.on('disconnect', () => {
        console.log('user disconnected');
        userList.delete(socket);
        io.emit('user list', { users: Array.from(userList.values()) });
    });
});

io.on('connection', socket => {
    socket.on('authorization', async auth => {
        let usr = await models.User.findOne({ 'nickName': auth.nickName }, err => {
            if (err) {
                throw err;
            }
        });

        console.log(usr);

        if (usr === null) {
            usr = new models.User(auth);

            await usr.save(err => {
                if (err) {
                    throw err;
                }
            });
        }

        console.log(usr);

        let messages = await models.Messages.findOne();

        console.log(messages);

        if (messages === null) {
            messages = new models.Messages({ messages: [] });
            await messages.save(err => {
                if (err) {
                    throw err;
                }
            });
        }

        console.log(messages);

        userList.set(socket, usr);
        io.emit('authorization', messages, { users: Array.from(userList.values()) });
    });

    socket.on('message', async (uid, m) => {
        let messages = await models.Messages.findOne();

        console.log(uid, m);

        let usr = await models.User.findOne({ 'nickName': uid }, err => {
            if (err) {
                throw err;
            }
        });

        let msg = { image: '',
            name: usr.name,
            message: m
        };

        console.log(msg);

        messages.messages.push(msg);
        await messages.save();

        console.log(messages);

        io.emit('message', { messages: [msg] });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});