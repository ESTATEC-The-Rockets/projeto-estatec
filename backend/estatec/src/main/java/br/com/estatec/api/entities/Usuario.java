package br.com.estatec.api.entities;

import java.time.LocalDate;

import org.hibernate.validator.constraints.br.CPF;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import br.com.estatec.api.validations.annotations.TelefoneBR;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
	private Long id;

	@Pattern(regexp = "^[\\p{L}]+( [\\p{L}]+)*$", message = "O nome do usuário deve conter apenas letras e espaços.")
	@NotBlank(message = "O nome do usuário é obrigatório.")
	protected String nome;

	@NotBlank(message = "O RG é obrigatório.")
	@Pattern(regexp = "^[A-Za-z0-9.-]+$", message = "RG deve conter apenas números, letras, ponto e hífen.")
	@Size(min = 7, max = 12, message = "RG deve ter pelo menos 7 dígitos.")
	@Column(nullable = false, unique = true, length = 12)
	protected double rg;

	@NotBlank(message = "O CPF é obrigatório.")
	@CPF(message = "O CPF é inválido.")
	@Column(nullable = false, unique = true, length = 14)
	protected double cpf;

	@NotNull(message = "A data de nascimento é obrigatória.")
	@Past(message = "Data de nascimento deve estar no passado.")
	protected LocalDate dataNascimento;

	@Email(message = "E-mail inválido.")
	@Size(max = 120, message = "E-mail deve ter no máximo 120 caracteres.")
	@Column(unique = true, length = 120)
	protected String email;

	@NotBlank(message = "A senha é obrigatória.")
	@Pattern(regexp = "^[A-Za-z0-9_@#]+$", message = "A senha deve conter apenas letras, números, underline, arroba e hashtag.")
	@Size(min = 8, message = "A senha deve conter no mínimo 8 caracteres.")
	protected String senha;

	@TelefoneBR(message = "Telefone deve estar no padrão brasileiro.")
	@Column(length = 20, unique = true)
	@NotBlank(message = "O telefone é obrigatório.")
	protected String telefone;

	@NotNull(message = "O carro é obrigatório.")
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "fk_carro", nullable = false, unique = true)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	protected Carros carro;

	@NotNull(message = "O dono do carro é obrigatório.")
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "fk_dono", nullable = false, unique = true)
	@JsonManagedReference
	protected DonoCarro dono;

	public Usuario() {

	}

	public Usuario(String nome, double rg, double cpf, LocalDate dataNascimento, String email, String senha,
			String telefone) {
		this.nome = nome;
		this.rg = rg;
		this.cpf = cpf;
		this.dataNascimento = dataNascimento;
		this.email = email;
		this.senha = senha;
		this.telefone = telefone;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public double getRg() {
		return rg;
	}

	public void setRg(double rg) {
		this.rg = rg;
	}

	public double getCpf() {
		return cpf;
	}

	public void setCpf(double cpf) {
		this.cpf = cpf;
	}

	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	public void setNascimento(LocalDate dataNascimento) {
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

}
