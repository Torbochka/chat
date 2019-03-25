let bodyParser = require('body-parser');
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const models = require('./models');
const userList = new Map();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');
app.set('views', 'src');

app.get('/', (req, res) => res.render('index.hbs'));

let usrFindById = (uid) => {
    return models.User.findOne({ '_id': uid }, err => {
        if (err) {
            throw err;
        }
    });
};

let createMessage = () => {
    let messages = new models.Messages({ messages: [] });

    return messages.save(err => {
        if (err) {
            throw err;
        }
    });
};

app.post('/auth', async (req, res) => {

    let usr = await models.User.findOne({ 'name': req.body.name, 'nickName': req.body.nickname }, err => {
        if (err) {
            throw err;
        }
    });

    console.log('auth. Есть ли юзер?' + usr);

    if (usr === null) {
        usr = new models.User({
            name: req.body.name,
            nickName: req.body.nickname,
            image: ''
        });
        await usr.save(err => {
            if (err) {
                throw err;
            }
        });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.json(usr);
});

io.on('connection', socket => {
    socket.on('disconnect', () => {
        console.log('user disconnected');
        userList.delete(socket);
        io.emit('user list', { users: Array.from(userList.values()) });
    });
});

io.on('connection', socket => {
    socket.on('authorization', async auth => {
        let usr = await usrFindById(auth._id);

        userList.set(socket, usr);

        // let messages = await models.Messages.findOne();

        let messages = await models.Messages.findOne()
            .populate('messages.user')
            .exec(function (err, user) {
                if (err) {
                    throw err;
                }
                console.log('The user is %s');
                // prints "The author is Ian Fleming"
            });

        console.log('Поиск messages:' + messages);

        if (messages === null) {
            messages = await createMessage();
        }

        console.log('После создания messages:' + messages);

        io.emit('authorization', messages, { users: Array.from(userList.values()) });
    });

    socket.on('message', async (uid, m) => {
        let messages = await models.Messages.findOne();
        let usr = await usrFindById(uid);

        console.log('message. Есть ли user?' + usr);

        let msg = {
            user: usr._id,
            message: m
        };

        console.log(msg);

        messages.messages.push(msg);
        await messages.save();

        io.emit('message', { messages: [msg] });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});