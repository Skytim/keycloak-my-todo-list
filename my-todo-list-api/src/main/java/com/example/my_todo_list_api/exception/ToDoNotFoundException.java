package com.example.my_todo_list_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ToDoNotFoundException extends RuntimeException {

    public ToDoNotFoundException(String message) {
        super(message);
    }
}