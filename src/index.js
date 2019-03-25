import './client/View/style.css';
import io from 'socket.io-client';
import View from './client/View/View';
import Messages from './client/messages.hbs';
import UserList from './client/userList.hbs';

const login = document.querySelector('#login');
const m = document.querySelector('#m');
const send = document.querySelector('#send');
const photo = document.querySelector('#photoInput');
const dropArea = document.querySelector('#target');
const uploadBtn = document.querySelector('#upload');

let fileReader = new FileReader();

let socket = io.connect('http://localhost:3000');

let getCookies = () => {
    let c = document.cookie;

    return c ? c.split('; ').reduce((prev, current) => {
        let [name, value] = current.split('=');

        prev[name] = value;

        return prev;
    }, {}) : {};
};

let authUser = () => {

    // let form = new FormData();
    //
    // form.append('name', document.forms['login-form'].name.value);
    // form.append('nickName', document.forms['login-form'].nickname.value);

    let myHeaders = new Headers();

    myHeaders.set('Content-Type', 'application/json');

    return fetch('/auth', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
            name: document.forms['login-form'].name.value,
            nickName: document.forms['login-form'].nickname.value
        })
    }).then(res => {
        if (res.status >= 400) {
            return Promise.reject();
        }

        return res.json();
    });
};

login.addEventListener('click', e => {
    e.preventDefault();
    let auth = authUser();

    auth.then(auth => {
        View.setProfileName(auth, 'pname');
        document.cookie = `_id=${auth._id}`;
    });
    auth.then(auth => socket.emit('authorization', auth));

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

        let c = getCookies();

        socket.emit('message', c._id, m.value);
        m.value = '';
    });

    socket.on('message', message => {
        View.addMessage(Messages, message, 'messages', 'li');
    });

    uploadBtn.addEventListener('click', () => {
        fileReader.result;

        socket.emit('message', fileReader.result);
    });

    photo.addEventListener('click', () => {
        View.displayElement('upload-photo', 'block');
    });

    // Добавим перетаскивание
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropArea.addEventListener('drop', e => {
        handleDrop(e);
    }, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let file = dt.files[0];

        if (file) {
            if (file.size > 512*1024) {
                alert('Слишком большой файл!');

                return;
            }

            console.debug('debug!!');

            fileReader.readAsDataURL(file);
            fileReader.addEventListener('load', () => {
                let img = document.querySelector('#target>img');

                img.src = fileReader.result;
            });
        }
    }

});

