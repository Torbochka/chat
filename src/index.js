import './client/View/style.css';
import io from 'socket.io-client';
import View from './client/View/View';
import Messages from './client/messages.hbs';
import UserList from './client/userList.hbs';

const login = document.querySelector('#login');
const m = document.querySelector('#m');
const send = document.querySelector('#send');

let socket = io.connect('http://localhost:3000');

login.addEventListener('click', e => {
    e.preventDefault();

    let auth = {
        name: document.forms['login-form'].name.value,
        nickName: document.forms['login-form'].nickname.value
    };

    socket.emit('authorization', auth);
    View.setProfileName(auth, 'pname');
    View.displayElement('authorization', 'none');

    socket.on('authorization', (messages, users) => {
        View.render(UserList, users, 'users-list');
        View.render(Messages, messages, 'messages');
    });

    socket.on('user list', users => {
        View.render(UserList, users, 'users-list');
    });

    send.addEventListener('click', e => {
        e.preventDefault();

        socket.emit('message', send.dataset.id, m.value);
        m.value = '';
    });

    socket.on('message', message => {
        View.addMessage(Messages, message, 'messages', 'li');
    });
});

