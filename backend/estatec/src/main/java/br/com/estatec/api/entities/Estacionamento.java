package br.com.estatec.api.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "tb_estacionamento")
public class Estacionamento {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idEstacionamento;

	@Pattern(regexp = "^[\\p{L}]+( [\\p{L}]+)*$", message = "O nome do estacionamento deve conter apenas letras e espaços.")
	@NotBlank(message = "O nome do estacionamento é obrigatório.")
	@Column(name = "nome_estacionamento", unique = true, length = 100)
	private String nomeEstacionamento;
	
	@ManyToOne
    @JoinColumn(name = "fk_dono_estacionamento")
    private DonoEstacionamento donoEstacionamento;

	public Estacionamento() {
	}

	public Estacionamento(String nomeEstacionamento, int qtdVagas, String localizacao) {
		this.nomeEstacionamento = nomeEstacionamento;
	}

	public String getNomeEstacionamento() {
		return nomeEstacionamento;
	}

	public void setNomeEstacionamento(String nomeEstacionamento) {
		this.nomeEstacionamento = nomeEstacionamento;
	}

}
