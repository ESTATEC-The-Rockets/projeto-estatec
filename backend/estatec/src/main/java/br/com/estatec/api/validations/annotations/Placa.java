package br.com.estatec.api.validations.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import br.com.estatec.api.validations.validators.PlacaValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = PlacaValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Placa {
    
    String message() default "Placa fora dos padrões.";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default{};
    
}





    
