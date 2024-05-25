package com.example.my_todo_list_api.repository;


import com.example.my_todo_list_api.model.ToDo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ToDoRepository extends JpaRepository<ToDo, Long> {
}
