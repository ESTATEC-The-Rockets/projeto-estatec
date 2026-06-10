package br.com.estatec.api.validations.validators;

import br.com.estatec.api.validations.annotations.Placa;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PlacaValidator implements ConstraintValidator<Placa, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext context) {

        if (valor == null) {
            return true;
        }

        valor = valor.toUpperCase();

        String regexAntiga = "^[A-Z]{3}-?[0-9]{4}$";
        String regexMercosul = "^[A-Z]{3}[0-9][A-Z][0-9]{2}$";

        return valor.matches(regexAntiga) || valor.matches(regexMercosul);
    }
}