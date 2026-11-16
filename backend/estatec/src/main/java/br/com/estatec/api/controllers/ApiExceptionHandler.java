package br.com.estatec.api.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException ex) {
        var error = ex.getBindingResult().getFieldErrors().stream()
            .sorted(java.util.Comparator.comparingInt((org.springframework.validation.FieldError e) -> "NotBlank".equals(e.getCode()) || "NotNull".equals(e.getCode()) ? 0 : 1)
                .thenComparing(org.springframework.validation.FieldError::getField))
            .findFirst().orElse(null);
        if (error == null) return Avisos.resposta(400, "CHECK_DATA");
        boolean required = "NotBlank".equals(error.getCode()) || "NotNull".equals(error.getCode());
        boolean size = "Size".equals(error.getCode());
        String key = switch (error.getField()) {
            case "nome", "nomeEstacionamento" -> required ? (error.getField().equals("nomeEstacionamento") ? "PARKING_NAME_REQUIRED" : "NAME_REQUIRED") : size ? "NAME_LONG" : "NAME_INVALID";
            case "email" -> required ? "EMAIL_REQUIRED" : size ? "EMAIL_LONG" : "EMAIL_INVALID";
            case "senha" -> required ? "PASSWORD_REQUIRED" : error.getRejectedValue() instanceof String s && s.length() < 8 ? "PASSWORD_SHORT" : "PASSWORD_LONG";
            case "confirmacaoSenha" -> required ? "PASSWORD_CONFIRM_REQUIRED" : "PASSWORD_LONG";
            case "cpf" -> required ? "CPF_REQUIRED" : "CPF_INVALID";
            case "telefone" -> required ? "PHONE_REQUIRED" : "PHONE_INVALID";
            case "marca" -> required ? "BRAND_REQUIRED" : "BRAND_LENGTH";
            case "modelo" -> required ? "MODEL_REQUIRED" : "MODEL_LENGTH";
            case "placa" -> required ? "PLATE_REQUIRED" : "PLATE_INVALID";
            default -> "CHECK_DATA";
        };
        return Avisos.resposta(400, key);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> conflict(DataIntegrityViolationException ex, jakarta.servlet.http.HttpServletRequest request) {
        LOG.warn("Conflito de integridade em {}", request.getRequestURI(), ex);
        return Avisos.resposta(409, "DELETE".equals(request.getMethod()) ? "DELETE_CONFLICT" : "SAVE_CONFLICT");
    }
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> status(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        return Avisos.resposta(status, Avisos.motivo(ex.getReason(), status));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<?> invalidRequest(Exception ex) { return Avisos.resposta(400, "CHECK_DATA"); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> unexpected(Exception ex) {
        if (ex instanceof org.springframework.web.ErrorResponse response) {
            int status = response.getStatusCode().value();
            return Avisos.resposta(status, Avisos.padrao(status));
        }
        LOG.error("Erro inesperado ao atender uma solicitacao", ex);
        return Avisos.resposta(500, "TRY_AGAIN");
    }
}
