package br.com.estatec.api.entities;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "Documentos")
public class Documentos {
	
	@NotBlank(message = "O RG é obrigatório.")
	@Pattern(regexp = "^[A-Za-z0-9.-]+$", message = "RG deve conter apenas números, letras, ponto e hífen.")
	@Size(min = 7, max = 12, message = "RG deve ter pelo menos 7 dígitos.")
	@Column(nullable = false, unique = true, length = 12)
	protected String rg;
	
	@NotBlank(message = "O CPF é obrigatório.")
	@CPF(message = "O CPF é inválido.")
	@Column(nullable = false, unique = true, length = 14)
	protected String cpf;


}
