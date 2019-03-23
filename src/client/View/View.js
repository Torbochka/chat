export default {
    render(template, model, id) {
        document.getElementById(id).innerHTML = template(model);
    },

    addMessage(template, model, id, tag) {
        let element = document.createElement(tag);

        // TODO пофиксить вложенность
        element.innerHTML = template(model);
        document.getElementById(id).appendChild(element);
    },

    setProfileName(model, id) {
        const p = document.getElementById(id);
        const send = document.querySelector('#send');

        send.setAttribute('data-id', model.nickName);
        p.innerHTML = model.name;
    },

    displayElement(id, display) {
        document.getElementById(id).style.display = display;
    }
}