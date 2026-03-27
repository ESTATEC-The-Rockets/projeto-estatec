package br.com.estatec.api.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotNull;

public class DonoCarro extends Usuario {
	
	public DonoCarro(String nome, String rg, String cpf, LocalDate dataNascimento, String email, String senha,
			String telefone) {
		super(nome, rg, cpf, dataNascimento, email, senha, telefone);
	}
	
	@NotNull(message = "O carro é obrigatório.")
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "fk_carro", nullable = false, unique = true)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	protected Carros carro;
	
	public DonoCarro() {}
	
	public DonoCarro(Carros carro) {
		this.carro = carro;
	}

	public Carros getCarro() {
		return carro;
	}

	public void setCarro(Carros carro) {
		this.carro = carro;
	}
	

}
