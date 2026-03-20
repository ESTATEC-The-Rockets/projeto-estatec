package br.com.estatec.api.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "estacionamento")
public class Estacionamento {

	@Pattern(regexp = "^[\\p{L}]+( [\\p{L}]+)*$", message = "O nome do estacionamento deve conter apenas letras e espaços.")
	@NotBlank(message = "O nome do estacionamento é obrigatório.")
	private String nomeEstacionamento;
	
	@NotNull(message = "A quantidade de vagas é obrigatória.")
	private int qtdVagas;

	public Estacionamento() {
	}

	public Estacionamento(String nomeEstacionamento, int qtdVagas) {
		this.nomeEstacionamento = nomeEstacionamento;
		this.qtdVagas = qtdVagas;
	}

	public String getNomeEstacionamento() {
		return nomeEstacionamento;
	}

	public void setNomeEstacionamento(String nomeEstacionamento) {
		this.nomeEstacionamento = nomeEstacionamento;
	}

	public int getQtdVagas() {
		return qtdVagas;
	}

	public void setQtdVagas(int qtdVagas) {
		this.qtdVagas = qtdVagas;
	}

}
