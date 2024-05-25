import axios from 'axios'

export const myToDoListApi = {
    getToDos,
    addToDo,
    deleteToDo,
    updateToDo
}

function getToDos() {
    return instance.get('/api/todos')
}

function addToDo(addToDoRequest) {
    return instance.post('/api/todos', addToDoRequest, {
        headers: { 'Content-type': 'application/json' }
    })
}

function deleteToDo(id) {
    return instance.delete(`/api/todos/${id}`)
}

function updateToDo(id, completed) {
    return instance.patch(`/api/todos/${id}?completed=${completed}`)
}

// -- Axios

const instance = axios.create({
    baseURL: 'http://localhost:8080'
})