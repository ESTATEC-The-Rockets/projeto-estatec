package br.com.estatec.api.entities;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class DonoCarro extends Usuario {

    @OneToMany(mappedBy = "donoCarro", cascade = CascadeType.ALL) 
    private List<Carros> carros;
	
	public DonoCarro() {}
	
	public DonoCarro(String nome, String rg, String cpf, LocalDate dataNascimento, String email, String senha, String telefone) {
	    super(nome, dataNascimento, email, senha, telefone, rg, cpf);
	}
	

}
