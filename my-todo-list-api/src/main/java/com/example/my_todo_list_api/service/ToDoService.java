package com.example.my_todo_list_api.service;

import com.example.my_todo_list_api.model.ToDo;

import java.util.List;

public interface ToDoService {

    ToDo getToDo(long id);

    List<ToDo> getToDos();

    ToDo addToDo(String description);

    void deleteToDo(long id);

    void updateToDo(long id, boolean completed);
}
