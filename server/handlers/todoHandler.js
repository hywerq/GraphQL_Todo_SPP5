const todoController = require('../controllers/todoController');
const roleValidation = require('../validation/roleValidation');

exports.getTodos = () => {
    return todoController.getAllTodos();
}

exports.newTodo = (todo, token) => {
    const access = roleValidation('ADMIN', token)();
    console.log(access)
    if(access) {
        return todoController.addNewTodo(todo);
    }
    else {
        return JSON.stringify({message: 'Access denied', type: 'error'});
    }
}

exports.changeTodo = (id) => {
    return todoController.changeTodoStatus(id);
}