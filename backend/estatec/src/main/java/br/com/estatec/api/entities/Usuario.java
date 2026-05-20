package br.com.estatec.api.entities;

import java.time.LocalDate;

import org.hibernate.validator.constraints.br.CPF;

import br.com.estatec.api.validations.annotations.TelefoneBR;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_usuario")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idUsuario;

	@Pattern(regexp = "^[\\p{L}]+( [\\p{L}]+)*$", message = "O nome do usuário deve conter apenas letras e espaços.")
	@NotBlank(message = "O nome do usuário é obrigatório.")
	@Column(name = "nome_usuario", length = 120, unique = false)
	protected String nome;

	@NotBlank(message = "O RG é obrigatório.")
	@Pattern(regexp = "^[A-Za-z0-9.-]+$", message = "RG deve conter apenas números, letras, ponto e hífen.")
	@Size(min = 7, max = 12, message = "RG deve ter pelo menos 7 dígitos.")
	@Column(name = "rg", unique = true, length = 12)
	protected String rg;

	@NotBlank(message = "O CPF é obrigatório.")
	@CPF(message = "O CPF é inválido.")
	@Column(name = "cpf", unique = true)
	protected String cpf;

	@NotNull(message = "A data de nascimento é obrigatória.")
	@Past(message = "Data de nascimento deve estar no passado.")
	@Column(name = "data_nascimento", unique = false)
	protected LocalDate dataNascimento;

	@Email(message = "E-mail inválido.")
	@Size(max = 120, message = "E-mail deve ter no máximo 120 caracteres.")
	@Column(name = "email", unique = true)
	protected String email;

	@NotBlank(message = "A senha é obrigatória.")
	@Pattern(regexp = "^[A-Za-z0-9_@#]+$", message = "A senha deve conter apenas letras, números, underline, arroba e hashtag.")
	@Size(min = 8, message = "A senha deve conter no mínimo 8 caracteres.")
	@Column(name = "senha", unique = false)
	protected String senha;

	@TelefoneBR(message = "Telefone deve estar no padrão brasileiro.")
	@Column(unique = true, name = "telefone")
	@NotBlank(message = "O telefone é obrigatório.")
	protected String telefone;

	public Usuario() {

	}


	public Usuario(String nome, LocalDate dataNascimento, String email, String senha,
			String telefone, String rg, String cpf) {

		this.nome = nome;
		this.rg = rg;
		this.cpf = cpf;
		this.dataNascimento = dataNascimento;
		this.email = email;
		this.senha = senha;
		this.telefone = telefone;
		this.rg = rg;
		this.cpf = cpf;
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
		this.nome = nome;
	}


	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}

	public String getRg() {
		return rg;
	}

	public void setRg(String rg) {
		this.rg = rg;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}
	
	


}
