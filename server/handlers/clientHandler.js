const authController = require('../controllers/authController');

exports.alertBroadcast = (ws, wss, msg) => {
    ws.id = msg.id;
    wss.clients.forEach(client => {
        if(client.id !== msg.id) {
            client.send(JSON.stringify({message: msg.message}));
        }
    })
}

exports.login = (login, password) => {
    return authController.login(login, password);
}

exports.register = (login, password) => {
    return authController.registration(login, password);
}

exports.logout = () => {
    return authController.removeCookie();
}