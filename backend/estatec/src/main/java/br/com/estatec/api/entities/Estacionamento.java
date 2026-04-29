package br.com.estatec.api.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "tb_estacionamento")
public class Estacionamento {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Pattern(regexp = "^[\\p{L}]+( [\\p{L}]+)*$", message = "O nome do estacionamento deve conter apenas letras e espaços.")
	@NotBlank(message = "O nome do estacionamento é obrigatório.")
	private String nomeEstacionamento;
	
	@NotNull(message = "A quantidade de vagas é obrigatória.")
	private int qtdVagas;
	
	@NotNull(message = "Insira a localização do seu estacionamento.")
	private String localizacao;
	
	@ManyToOne
	@JoinColumn(name = "dono_id")
	private DonoEstacionamento donoEstacionamento;

	public Estacionamento() {
	}

	public Estacionamento(String nomeEstacionamento, int qtdVagas, String localizacao) {
		this.nomeEstacionamento = nomeEstacionamento;
		this.qtdVagas = qtdVagas;
		this.localizacao = localizacao;
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
	
	public String getLocalizacao() {
		return localizacao;
	}
	public void setLocalizacao(String localizacao) {
		this.localizacao = localizacao;
	}

}
