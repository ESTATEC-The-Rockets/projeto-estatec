package br.com.estatec.api.entities;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name="tb_dono_estacionamento")
public class DonoEstacionamento extends Usuario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotNull(message = "O carro é obrigatório.")
	protected Estacionamento estacionamento;
	
	
	public DonoEstacionamento() {
		
	}
	public DonoEstacionamento(String nome, String rg, String cpf, LocalDate dataNascimento, String email, String senha,
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
