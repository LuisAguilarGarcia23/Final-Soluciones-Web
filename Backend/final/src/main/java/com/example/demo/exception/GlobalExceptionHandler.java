package com.example.demo.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(RuntimeException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public Map<String, String> handleRuntimeException(RuntimeException ex) {
		Map<String, String> error = new HashMap<>();
		error.put("mensaje", ex.getMessage());
		return error;
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public Map<String, String> handleValidationException(MethodArgumentNotValidException ex) {
		Map<String, String> errores = new HashMap<>();

		ex.getBindingResult().getFieldErrors().forEach(error -> {
			errores.put(error.getField(), error.getDefaultMessage());
		});

		return errores;
	}
}