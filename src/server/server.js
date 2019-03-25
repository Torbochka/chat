let bodyParser = require('body-parser');
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const models = require('./models');
const userList = new Map();

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');
app.set('views', 'src');

app.get('/', (req, res) => res.render('index.hbs'));

let formatDate = (date) => {
    let m = date.getMonth().length > 1 ? date.getMonth() : `0${date.getMonth()}`;
    let d = date.getDay().length > 1 ? date.getDay() : `0${date.getDay()}`;

    return [
        `${date.getFullYear()}.${m}.${d}`,
        `${date.getHours()}:${m}:${date.getSeconds()}`
    ].join(' ');
};

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

let getOrCreateMessages = async () => {
    let messages = await models.Messages.findOne()
        .populate({
            path: 'messages.user',
            model: 'User'
        });

    console.log('Поиск messages:' + messages);

    if (messages === null) {
        messages = await createMessage();
    }

    return messages;
};

app.post('/auth', async (req, res) => {

    let usr = await models.User.findOne({ 'name': req.body.name, 'nickName': req.body.nickname }, err => {
        if (err) {
            throw err;
        }
    });

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
        io.emit('authorization', await getOrCreateMessages(), { users: Array.from(userList.values()) });
    });

    socket.on('updatePhoto', async (uid, img) => {
        let usr = await usrFindById(uid);

        usr.image = img;

        await usr.save(err => {
            if (err) {
                throw err;
            }
        });

        io.emit('updatePhoto', await getOrCreateMessages());

    });

    socket.on('message', async (uid, m) => {
        let messages = await models.Messages.findOne();
        let usr = await usrFindById(uid);

        let msg = {
            user: usr,
            message: m,
            date: formatDate(new Date())
        };

        console.log(msg);

        messages.messages.push(msg);
        await messages.save();

        io.emit('message', { messages: [msg] });
    });
});

http.listen(process.env.PORT, () => {
    console.log('listening on *:3000');
});