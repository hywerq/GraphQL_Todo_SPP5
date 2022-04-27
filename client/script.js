function sendServerRequest() {
    return {
        async authUser(url, cb) {
            const query = `query
            {
                authUser(
                    login: "${form.elements['username'].value}" 
                    password: "${form.elements['password'].value}"
                ) 
            }`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json());

            const result = JSON.parse(response['data']['authUser']);

            cb(result);
        },
        async regUser(url, cb) {
            const query = `query
            {
                regUser(
                    login: "${form.elements['username'].value}" 
                    password: "${form.elements['password'].value}"
                ) 
            }`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json());

            const result = JSON.parse(response['data']['regUser']);

            cb(result);
        },
        async getToken(url, cb) {
            const query = `query
            {
                logOut
            }`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json());

            const result = JSON.parse(response['data']['logOut']);
            cb(result);
        },
        async getTodos(url, cb) {
            const query = `query
            {
                getAllTodos
            }`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json());

            const result = JSON.parse(response['data']['getAllTodos']);
            const todos = JSON.parse(result.todos);
            cb(todos.todo);
        },
        async addTodo(url, cb) {
            const query = `mutation
            {
                addNewTodo(input:{
                    title: "${todoTitleInput.value}", 
                    date: "${makeDate(todoDateInput.value)}"
                    file: "${todoFileInput.files[0]}"
                },
                token: "${token}")
            }`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json());
            console.log(response)
            const result = JSON.parse(response['data']['addNewTodo']);

            cb(result);
        },
        async changeStatus(id, url, cb) {
            const query = `query
            {
                changeTodoStatus(id: "${id}")
            }`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json());

            const result = JSON.parse(response['data']['changeTodoStatus']);
            const todos = JSON.parse(result.todos);
            cb(todos.todo);
        },
    };
}

const server = sendServerRequest();
let username = '';
let token = '';

const entranceService = (function() {
    const url = 'http://localhost:5000/';

    return {
        async login(cb) {
            await server.authUser(url, cb);
        },
        async register(cb) {
            await server.regUser(url, cb);
        },
        async logout(cb) {
            await server.getToken(url, cb);
        }
    };
})();
const todoService = (function() {
    const url = 'http://localhost:5000/';

    return {
        async allTodos(cb) {
            await server.getTodos(url, cb);
        },
        async insertTodo(cb) {
            await server.addTodo(url, cb);
        },
        async editTodo(id, cb) {
            await server.changeStatus(id, url, cb);
        }
    };
})();

let form = document.forms['entrance_form'];
let todoTitleInput = form.elements['title'];
let todoFileInput = form.elements['file'];
let todoDateInput = form.elements['date'];

function onGetResponse(res) {
    removePreloader();

    console.log(res);

    if (res.type === 'error') {
        showAlert(res.message, 'rounded red');
        return;
    }

    if(res.message)
    {
        showAlert(res.message);
    }

    if(res.token === 'false') {
        renderEntranceForm();
        return;
    }
    else if(res.token) {
        token = res.token;
        renderNavigation();
        loadTodos();
        return;
    }

    if (Array.isArray(res)) {
        if(!res.length) {
            showAlert('There are no todos yet!');
        }
        else {
            renderTodos(res);
        }
    }
}

function loadTodos() {
    showPreloader();

    todoService.allTodos(onGetResponse).catch(error => showAlert(error));
}

function addTodo() {
    showPreloader();

    todoService.insertTodo(onGetResponse).catch(error => showAlert(error));
}

function changeTodoStatus(id) {
    showPreloader();

    todoService.editTodo(id, onGetResponse).catch(error => showAlert(error));
}

function makeDate(date) {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        year: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric'
    }).toString();
}

function renderEntranceForm() {
    const entranceForm = document.querySelector("main");
    if (entranceForm) {
        return;
    }

    const todosContainer = document.querySelector(".container ul");
    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    const navBar = document.querySelector("nav");
    if(navBar) {
        navBar.remove();
    }

    const body = document.body;

    let fragment =
        `<main>
        <div class="circle"></div>
        <div class="register-form-container">
            <form name="entrance_form" action="">
                <h1 class="form-title">
                    Welcome
                </h1>

                <div class="form-fields">
                    <div class="form-field">
                        <input class="entrance-input" type="text" placeholder="Username" name="username" required pattern="[а-яА-Яa-zA-Z]+"
                            title="Username consists of letters only">
                    </div>
                    <div class="form-field">
                        <input class="entrance-input" type="password" placeholder="Password" name="password" required minlength="8" maxlength="128">
                    </div>
                </div>

                <div class="form-buttons">
                    <button class="button button-google" id="id_login">Login</button>
                    <div class="divider">or</div>
                    <button class="button" id="id_register">Register</button>
                </div>

            </form>
        </div>
    </main>`

    body.insertAdjacentHTML('afterbegin', fragment);
}

function renderNavigation() {
    const entrance = document.querySelector("main");

    if (entrance) {
        entrance.remove();
    }

    const body = document.body;

    let fragment =
        `<nav class="teal">
            <div class="nav-wrapper">
                <a class="brand-logo">TODOS</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li class="inactive"><a id="output">All</a></li>
                    <li class="active"><a id="input">New</a></li> 
                    <li><a href="/" id="log_out">Log Out</a></li>                  
                </ul>
            </div>
        </nav>`;

    body.insertAdjacentHTML('afterbegin', fragment);
}

function renderInputForm() {
    const inputForm = document.querySelector(".new-todo");
    if (inputForm) {
        return;
    }

    const todosContainer = document.querySelector(".container ul");
    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    const currentPage = document.querySelector('.active');
    const nextPage = document.querySelector('.inactive');
    currentPage.classList.replace('active', 'inactive');
    nextPage.classList.replace('inactive', 'active');

    document.querySelector(".teal").insertAdjacentHTML(
        'afterend',
        `
                <form class="new-todo" enctype="multipart/form-data" name="new-todo">
        <div class="input-field">
            <input type="text" name="title" placeholder="Todo title" required>
        </div>
        <div class="input-field">
            <input type="datetime-local" name="date" placeholder="Todo date" required>
        </div>

        <label>
            <div class="example-1">
                <div class="form-group">
                    <label class="label">
                        <i class="material-icons">attach_file</i>
                        <span class="title" id="file">Load file</span>
                        <input name="file" type="file">
                    </label>
                </div>
            </div>

            <button class="btn">Add</button>
        </label>
    </form>`
    );

    initForm();
}

function renderTodos(todos) {
    const currentPage = document.querySelector('.active');
    const nextPage = document.querySelector('.inactive');
    currentPage.classList.replace('active', 'inactive');
    nextPage.classList.replace('inactive', 'active');

    const todosContainer = document.querySelector('.container ul');

    if (todosContainer.children.length) {
        clearContainer(todosContainer);
    }

    let fragment = ``;
    todos.forEach(todo => {
        const el = todosTemplate(todo);
        fragment += el;
    });

    todosContainer.insertAdjacentHTML('afterbegin', fragment);
}

function todosTemplate({ id, title, completed, date, hasFile, file }) {
    let html = '';

    if (completed === 'true') {
        html += `
            <li class="todo">
                <form method="post">
                    <label>
                        <div class="status">
                            <input type="checkbox" checked name="completed">
                            <span class="completed">${date}</span>
                        </div>
                        <div class="task-title">
                            <span class="completed">${title}</span>
                        </div>`;
    }
    else {
        html += `
            <li class="todo">
                <form name="todoForm">
                    <label>
                        <div class="status">
                            <input type="checkbox" name="completed">
                            <span>${date}</span>
                        </div>
                        <div class="task-title">
                            <span>${title}</span>
                        </div>`;
    }

    if(hasFile === 'true') {
        html += `
                            <div class="task-file">
                                <form method="get" action="${file}">
                                    <a href="${file}" download="${file}">Download</a>
                                </form>
                            </div>

                        <input type="hidden" value="${id}" name="id">
                        <div class="save">
                            <button class="btn btn-small" id="id_save_state_btn" type="submit">Save</button>
                        </div>
                    </label>
                </form>
            </li>`;
    }
    else {
        html += `
                        <div class="task-file"></div>
                        
                        <input type="hidden" value="${id}" name="id">
                        <div class="save">
                            <button class="btn btn-small" id="id_save_state_btn" type="submit">Save</button>
                        </div>
                    </label>
                </form>
            </li>`;
    }

    return html;
}

function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function showAlert(msg, type = 'rounded') {
    M.toast({ html: msg, classes: type });
}

function showPreloader() {
    const preloader = document.querySelector('.progress');

    if (preloader) {
        return;
    }

    document.querySelector('.teal').insertAdjacentHTML(
        'afterend',
        `
        <div class="progress">
            <div class="indeterminate"></div>
        </div>`
    );
}

function removePreloader() {
    const preloader = document.querySelector('.progress');

    if (preloader) {
        preloader.remove();
    }
}

function initForm() {
    form = document.forms['new-todo'];
    todoTitleInput = form.elements['title'];
    todoFileInput = form.elements['file'];
    todoDateInput = form.elements['date'];

    form.addEventListener('submit', async e => {
        e.preventDefault();
        addTodo();
    });

    todoFileInput.addEventListener("change", function () {
        document.getElementById('file').innerHTML = todoFileInput.files[0].name;
    });
}

document.body.addEventListener( 'click', e => {
    switch (e.target.id) {
        case 'id_login':
            e.preventDefault();
            entranceService.login(onGetResponse).catch(error => showAlert(error));
            break;

        case 'id_register':
            e.preventDefault();
            entranceService.register(onGetResponse).catch(error => showAlert(error));
            break;

        case 'id_save_state_btn':
            e.preventDefault();
            const id = e.path[3].id.defaultValue;
            changeTodoStatus(id);
            break;

        case 'input':
            e.preventDefault();
            renderInputForm();
            break;

        case 'output':
            e.preventDefault();
            const inputForm = document.querySelector(".new-todo");
            if (inputForm) {
                inputForm.remove();
            }
            loadTodos();
            break;

        case 'log_out':
            e.preventDefault();
            if (confirm("Do you want to log out?")) {
                entranceService.logout(onGetResponse).catch(error => showAlert(error));
            }
            break;
    }
});