const fs = require('fs');
const path = require('path');
const filePath = '../server/data/todo.json';

class todoController{
    async getAllTodos() {
        try {
            const content = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
            return JSON.stringify({response: 'todos', todos: content});
        }
        catch (e) {
            console.log(e);
            return JSON.stringify({message: `Couldn't read file`, type: 'error'});
        }
    }

    async addNewTodo(newTodo) {
        if(!newTodo) {
            return JSON.stringify({message: 'Error', type: 'error'});
        }

        let fileFlag = false;
        let file = '';

        if (newTodo.file !== undefined) {
            fileFlag = true;
            file = path.join('./uploads/' + newTodo.file.name);
        }

        const todoTitle = newTodo.title;
        const todoDate = newTodo.date;

        const data = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
        const todos = JSON.parse(data);
        const id = Math.max.apply(Math, todos.todo.map(function(o){ return o.id; }));

        let todo = {
            id: (id + 1).toString(),
            title: todoTitle,
            date: todoDate,
            hasFile: fileFlag.toString(),
            file: file,
            completed: 'false'
        };

        todos.todo.push(todo);

        const newData = JSON.stringify(todos);
        fs.writeFileSync(filePath, newData);

        return JSON.stringify({message: 'Successfully added!'});
    }

    async changeTodoStatus(id) {
        if(!id) {
            return JSON.stringify({message: 'Error', type: 'error'});
        }

        const data = fs.readFileSync(filePath,{encoding: 'utf-8', flag: 'r'});
        const todos = JSON.parse(data);

        todos.todo.forEach(todo => {
            if(todo.id === id) {
                todo.completed = todo.completed === 'false' ? 'true' : 'false';
            }
        });

        const newData = JSON.stringify(todos);
        fs.writeFileSync(filePath, newData);

        return JSON.stringify({response: 'todos', todos: newData });
    }
}

module.exports = new todoController;