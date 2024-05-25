package com.example.my_todo_list_api.service;

import com.example.my_todo_list_api.exception.ToDoNotFoundException;
import com.example.my_todo_list_api.model.ToDo;
import com.example.my_todo_list_api.repository.ToDoRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;



@RequiredArgsConstructor
@Service
public class ToDoServiceImpl implements ToDoService {

    private final ToDoRepository toDoRepository;

    @Override
    public ToDo getToDo(long id) {
        return toDoRepository.findById(id)
                .orElseThrow(() -> new ToDoNotFoundException(String.format("ToDo with id '%s' not found", id)));
    }

    @Override
    public List<ToDo> getToDos() {
        return toDoRepository.findAll();
    }

    @Override
    public ToDo addToDo(String description) {
        ToDo toDo = new ToDo();
        toDo.setDescription(description);
        return toDoRepository.save(toDo);
    }

    @Override
    public void deleteToDo(long id) {
        toDoRepository.delete(getToDo(id));
    }

    @Override
    public void updateToDo(long id, boolean completed) {
        ToDo toDo = getToDo(id);
        toDo.setCompleted(completed);
        toDoRepository.save(toDo);
    }
}