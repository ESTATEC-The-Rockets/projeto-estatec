package br.com.estatec.api.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class DonoCarro extends Usuario {

	
	@ManyToOne
    @JoinColumn(name = "fk_carro", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    protected Carros carro;
	
	public DonoCarro() {}
	
	public DonoCarro(String nome, String rg, String cpf, LocalDate dataNascimento, String email, String senha,
			String telefone) {
		super(nome, dataNascimento, cpf, rg, email, senha, telefone);
	}
	

}
