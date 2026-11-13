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
@Table(name = "tb_estacionamento") // Torna a entidade uma tabela no banco de dados
public class Estacionamento {
	
	// Atributos necessários da entidade "Estacionamento" com as restrições e validações de segurança
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idEstacionamento;

	@Pattern(regexp = "^[\\p{L}]+( [\\p{L}]+)*$", message = "O nome do estacionamento deve conter apenas letras e espaços.")
	@NotBlank(message = "O nome do estacionamento é obrigatório.")
	@Column(name = "nome_estacionamento", unique = true, length = 100)
	private String nomeEstacionamento;
	
	// Relação das entidades "Usuario" e "Estacionamento"
	@ManyToOne(cascade = jakarta.persistence.CascadeType.MERGE)
    @JoinColumn(name = "fk_dono_estacionamento") // gera uma foreign key na tabela no banco de dados
    private Usuario usuario;

	
	// Metodos construtores da entidade "Estacionamento"
	public Estacionamento() {
	}

	public Estacionamento(String nomeEstacionamento) {
		this.nomeEstacionamento = nomeEstacionamento;
	}
	

	// Getters e setter da entidade "Estacionamento"
	public String getNomeEstacionamento() {
		return nomeEstacionamento;
	}

	public void setNomeEstacionamento(String nomeEstacionamento) {
		this.nomeEstacionamento = nomeEstacionamento;
	}
	
	public Long getIdEstacionamento() {
	    return idEstacionamento;
	}

	public void setIdEstacionamento(Long idEstacionamento) {
	    this.idEstacionamento = idEstacionamento;
	}

	public Usuario getUsario() {
	    return usuario;
	}

	public void setUsuario(Usuario usuario) {
	    this.usuario = usuario;
	}

}
