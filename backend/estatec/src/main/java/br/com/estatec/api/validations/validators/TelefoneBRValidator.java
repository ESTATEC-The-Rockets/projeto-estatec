package br.com.estatec.api.validations.validators;

import br.com.estatec.api.validations.annotations.TelefoneBR;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TelefoneBRValidator implements ConstraintValidator<TelefoneBR, String>{

	@Override
	public boolean isValid(String valor, ConstraintValidatorContext context ) {
		
		if(valor == null) {
			return true;
		}
		
		String regex = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$";
		
		return valor.matches(regex);
		
	}
}
