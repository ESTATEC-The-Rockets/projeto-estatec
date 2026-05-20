package br.com.estatec.api.entities;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;

@Entity
public class DonoEstacionamento extends Usuario {
	
	@OneToMany(mappedBy = "donoEstacionamento", cascade = CascadeType.ALL)
	@JoinColumn(name = "estacionamento")
	private List<Estacionamento> estacionamentos;
	
	
	public DonoEstacionamento() {
		
	}
	public DonoEstacionamento(String nome, String rg, String cpf, LocalDate dataNascimento, String email, String senha,
			String telefone) {

		super(nome, dataNascimento, cpf, rg, email, senha, telefone);
	}
	
}
