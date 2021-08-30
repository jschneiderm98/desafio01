const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const userInStorage = users.find((user) => user.username === request.headers.username);

  if (!userInStorage)
    return response.status(404).json({error: "User not found"});

  request.user = userInStorage;

  return next();
}

app.post('/users', (request, response) => {

  const { username, name } = request.body;

  if (users.some((user) => user.username === username))
    return response.status(400).json({error: "User already exists"});
  
  const newUser = { id: uuidv4(), username, name, todos: [] };

  users.push(newUser);

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  
  const newTodo = { 
    id: uuidv4(), 
    title, 
    deadline: new Date(deadline), 
    created_at: new Date(), 
    done: false
  };

  request.user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { deadline, title } = request.body;

  const targetTodo = request.user.todos.find((todo) => todo.id === request.params.id);
  
  if(!targetTodo)
    return response.status(404).json({ error: 'Todo not found' });

  if (deadline)
    targetTodo.deadline = deadline;
  if (title)
    targetTodo.title = title;

  return response.status(200).json(targetTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const targetTodo = request.user.todos.find((todo) => todo.id === request.params.id);

  if(!targetTodo)
    return response.status(404).json({ error: 'Todo not found' });

  targetTodo.done = true;
  
  return response.status(200).json(targetTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const targetTodo = request.user.todos.find((todo) => todo.id === request.params.id);

  if(!targetTodo)
    return response.status(404).json({ error: 'Todo not found' });

  request.user.todos.splice(targetTodo, 1);

  return response.status(204).json(targetTodo);
});

module.exports = app;