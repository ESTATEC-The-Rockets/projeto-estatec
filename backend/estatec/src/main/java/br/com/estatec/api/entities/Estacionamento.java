package br.com.estatec.api.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table (name = "estacionamento")
public class Estacionamento {

	private String nomeEstacionamento;
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
