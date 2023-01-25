const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());



/**
 { 
	id: 'uuid', // precisa ser um uuid
	name: 'Danilo Vieira', 
	username: 'danilo', 
	todos: []
 }
 */
const users = [];

function checksExistsUserAccount(request, response, next) {
  const {body, headers} = request
  if(body && body.username){
    const isExists = users.some(user => user.username === body.username)
    if(isExists){
      return response.status(400).json({
        error: 'Username already exists'
      })
    }
  } else if(headers && headers.username) {
    const isExists = users.some(user => user.username === headers.username)
    if(!isExists){
      return response.status(400).json({
        error: 'Username is not exists'
      })
    }
  }
  
  next()
}

app.get('/users', (request, response) => {
  return response.status(200).json(users)
});

app.post('/users', checksExistsUserAccount, (request, response) => {
  const {name, username} = request.body
  const newUser = {id: uuidv4(), name, username, todos: []}
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const userTodos = users.find(user => user.username === username)
  if(userTodos){
    return response.status(200).json(userTodos.todos)
  } else {
    return response.status(404).json({message: 'Todos not found'})
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {username} = request.headers
  const user = users.find(user => user.username === username)

  const newTodo = {
    id: uuidv4(),
    title, 
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }
  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {username} = request.headers
  const {body} = request
  const user = users.find(user => user.username === username)
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  if(todoIndex === -1) return response.status(404).json({error: 'Not Found'})
  const title = body.title || user.todos[todoIndex].title
  const deadline = body.deadline ? new Date(body.deadline) : user.todos[todoIndex].deadline
  const newTodoData = Object.assign({}, {...user.todos[todoIndex], title, deadline  })
  user.todos[todoIndex] = newTodoData
  return response.status(200).json(newTodoData)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {username} = request.headers
  const user = users.find(user => user.username === username)
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  if(todoIndex === -1) return response.status(404).json({error: 'Todo is not found.'})
  const newTodoData = Object.assign({}, {...user.todos[todoIndex], done: true })
  user.todos[todoIndex] = newTodoData
  return response.status(200).json(newTodoData)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {username} = request.headers
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: 'Not Found'})
  const newTodos = user.todos.filter(todo => todo.id !== id)
  user.todos = newTodos
  return response.status(204).json()
});

module.exports = app;