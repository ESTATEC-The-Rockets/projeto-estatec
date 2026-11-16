package br.com.estatec.api.entities;

import java.util.List;


import br.com.estatec.api.validations.annotations.TelefoneBR;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_usuario") 
public class Condutor {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idUsuario;

	@Size(max = 120)
	@NotBlank(message = "O nome do condutor é obrigatório.")
	@Column(name = "nome_usuario", length = 120, unique = false)
	protected String nome;

	@NotBlank(message = "O CPF é obrigatório.")
	@org.hibernate.validator.constraints.br.CPF(message = "Informe um CPF válido.")
	@Column(name = "cpf", unique = true)
	protected String cpf;

	@Email(message = "E-mail inválido.")
	@Size(max = 120, message = "E-mail deve ter no máximo 120 caracteres.")
	@Column(name = "email", unique = true)
	@NotBlank(message = "O e-mail é obrigatório.")
	protected String email;

	@TelefoneBR(message = "Telefone deve estar no padrão brasileiro.")
	@Column(unique = true, name = "telefone")
	@NotBlank(message = "O telefone é obrigatório.")
	protected String telefone;
	
	@OneToMany(mappedBy = "usuario")
	private List<Carro> carros;
	
	@OneToMany(mappedBy = "usuario")
	private List<Estacionamento> estacionamentos;

	
	// Métodos construtores da entidade 
	public Condutor() {

	}


	public Long getId() {
	    return idUsuario;
	}

	public void setId(Long id) {
	    this.idUsuario = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome == null ? null : nome.trim().replaceAll("\\s+", " ");
	}


	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone == null ? null : telefone.replaceAll("[^0-9]", "");
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf == null ? null : cpf.replaceAll("[^0-9]", "");
	}

}
