package br.com.estatec.api.entities;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class DonoEstacionamento extends Usuario {
	
	@OneToMany(mappedBy = "donoEstacionamento", cascade = CascadeType.ALL)
	private List<Estacionamento> estacionamentos;
	
	
	public DonoEstacionamento() {
		
	}
	public DonoEstacionamento(String nome, LocalDate dataNascimento, String email, String senha,
	        String telefone, String rg, String cpf) {
	    
		super(nome, dataNascimento, email, senha, telefone, rg, cpf);
	}
	
}
