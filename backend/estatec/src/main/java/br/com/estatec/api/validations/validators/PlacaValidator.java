package br.com.estatec.api.validations.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PlacaValidator implements ConstraintValidator<PlacaValidator, String> {
	
	@Override
	public boolean isValid(String valor, ConstraintValidatorContext context) {
		
		if(valor == null) {
			return true;
		}
		
		String regexp="^[A-Z]{3}\\-?[0-9]\\[A-Z0-9]?[0-9]{2}$"; 
		
		
		return valor.matches(regexp);
	}

}
