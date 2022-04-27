const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const schema = require('./schema');
const {mongoDB, serverPORT} = require('../server/config');
const {graphqlHTTP} = require('express-graphql');

const clientHandler = require('./handlers/clientHandler');
const todoHandler = require('./handlers/todoHandler');

const app = express();
const PORT = serverPORT || 5000;

app.use(cors());

const root = {
    getAllTodos: () => {
        return todoHandler.getTodos();
    },
    addNewTodo: ({input, token}) => {
        return todoHandler.newTodo(input, token);
    },
    changeTodoStatus: ({id}) => {
        return todoHandler.changeTodo(id);
    },
    regUser: ({login, password}) => {
        return clientHandler.register(login, password);
    },
    authUser: ({login, password}) => {
        return clientHandler.login(login, password);
    },
    logout: () => {
        return clientHandler.logout();
    }
};

app.use('/', graphqlHTTP({
    graphiql: true,
    schema,
    rootValue: root
}));

const run = async () => {
    try {
        mongoose.connect(mongoDB).catch(err => console.log(err));
        app.listen(PORT, () => { console.log('Server has been started...') });
    }
    catch (err) {
        console.log(err);
    }
}

run();