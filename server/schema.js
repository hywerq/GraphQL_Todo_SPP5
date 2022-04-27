const {buildSchema} = require('graphql');

const schema = buildSchema(`
    type Todo {
        title: String
        date: String
        file: String
    }
    
    type User {
        username: String
        password: String
        roles: [Role]
    }
    
    type Role {
        value: String
    }
    
    input TodoInput {
        title: String!
        date: String!
        file: String
    }
    
    input UserInput {
        username: String!
        password: String!
        roles: [RoleInput]
    }
    
    input RoleInput {
        value: String!
    }
    
    type Query {
        getAllTodos: String
        regUser(login: String, password: String): String
        authUser(login: String, password: String): String
        changeTodoStatus(id: String): String
    }
    
    type Mutation {
        addNewTodo(input: TodoInput, token: String): String
    }
`);

module.exports = schema;