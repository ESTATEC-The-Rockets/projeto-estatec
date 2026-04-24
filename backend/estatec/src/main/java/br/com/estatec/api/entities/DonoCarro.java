package br.com.estatec.api.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table (name = "tb_dono_carro")
public class DonoCarro extends Usuario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "fk_carro", nullable = false)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	protected Carros carro;
	
	
	
	//Construtor
	public DonoCarro() {}
	
	public DonoCarro(String nome, String rg, String cpf, LocalDate dataNascimento, String email, String senha,
			String telefone) {
		super(nome, rg, cpf, dataNascimento, email, senha, telefone);
	}



	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	

}
