package com.mlaide.webserver.controller;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.mlaide.webserver.validation.Violation;
import com.mlaide.webserver.model.Error;
import com.mlaide.webserver.service.ConflictException;
import com.mlaide.webserver.service.InvalidInputException;
import com.mlaide.webserver.service.NotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.List;


@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
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
        Error error = new Error(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase());
        return handleExceptionInternal(e, error, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
    }

    private static final String ENUM_MSG = "values accepted for Enum class:";

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException e, HttpHeaders headers, HttpStatus status, WebRequest request) {
        if (e.getCause() instanceof InvalidFormatException) {
            boolean contains = e.getCause().getMessage().contains(ENUM_MSG);
            if (contains) {
                Error error = new Error(status.value(), e.getCause().getMessage());
                return handleExceptionInternal(e, error, headers, status, request);
            }
        }

        return super.handleHttpMessageNotReadable(e, headers, status, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    ResponseEntity<Object> handleConstraintValidation(
            ConstraintViolationException e, WebRequest request) {
        List<Violation> violations = new ArrayList<>();
        for (ConstraintViolation<?> violation : e.getConstraintViolations()) {
            violations.add(
                    new Violation(violation.getPropertyPath().toString(), violation.getMessage()));
        }
        Error error = new Error(HttpStatus.BAD_REQUEST.value(), e.getMessage(), violations);
        return handleExceptionInternal(e, error, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
                                                                  HttpHeaders headers, HttpStatus status, WebRequest request) {
        List<Violation> violations = new ArrayList<>();
        for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
            violations.add(
                    new Violation(fieldError.getField(), fieldError.getDefaultMessage()));
        }
        Error error = new Error(status.value(), e.getMessage(), violations);
        return handleExceptionInternal(e, error, headers, status, request);
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
