package io.mvc.webserver.controller;

import io.mvc.webserver.model.Error;
import io.mvc.webserver.service.ConflictException;
import io.mvc.webserver.service.InvalidInputException;
import io.mvc.webserver.service.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    private final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(value = { IllegalArgumentException.class, InvalidInputException.class})
    protected ResponseEntity<Object> handleBadRequest(Exception e, WebRequest request) {
        Error error = new Error(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        return handleExceptionInternal(e, error, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(value = { ConflictException.class })
    protected ResponseEntity<Object> handleConflict(ConflictException e, WebRequest request) {
        Error error = new Error(HttpStatus.CONFLICT.value(), e.getMessage());
        return handleExceptionInternal(e, error, new HttpHeaders(), HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(value = { NotFoundException.class })
    protected ResponseEntity<Object> handleNotFound(NotFoundException e, WebRequest request) {
        Error error = new Error(HttpStatus.NOT_FOUND.value(), e.getMessage());
        return handleExceptionInternal(e, error, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatus status, WebRequest request) {

        Error error;
        if (body instanceof Error) {
            error = (Error) body;
        } else {
            error = new Error(status.value(), body != null ? body.toString() : null);
        }

        return super.handleExceptionInternal(ex, error, headers, status, request);
    }
}
