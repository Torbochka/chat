export default {
    render(template, model, id) {
        document.getElementById(id).innerHTML = template(model);
    },

    addMessage(template, model, id, tag) {
        let element = document.createElement(tag);

        console.log(model);

        // TODO пофиксить вложенность
        element.innerHTML = template(model);
        document.getElementById(id).appendChild(element);
    },

    setProfileName(model, id) {
        const p = document.getElementById(id);
        const avatar = document.getElementById('avatar');

        avatar.src = model.image;
        p.innerHTML = model.name;
    },

    displayElement(id, display) {
        document.getElementById(id).style.display = display;
    }
}