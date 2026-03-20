package br.com.estatec.api.validations.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import br.com.estatec.api.validations.validators.TelefoneBRValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = TelefoneBRValidator.class) // criando uma anotação
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface TelefoneBR {
	
	String message() default "Telefone inválido.";
	
	Class<?>[] groups() default{};
	
	Class<? extends Payload>[] payload() default{};
	

}
