package br.com.estatec.api.entities;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table (name = "usuario")
public class Usuario {

	protected String nome;
	protected double rg;
	protected double cpf;
	protected LocalDate nascimento;
	protected String email;
	protected String senha;
	protected String telefone;
	
	public Usuario() {
		
	}
	
	public Usuario(String nome, double rg, double cpf, LocalDate nascimento, String email, String senha, String telefone) {
		this.nome = nome;
		this.rg = rg;
		this.cpf = cpf;
		this.nascimento = nascimento;
		this.email = email;
		this.senha = senha;
		this. telefone = telefone;
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

	public LocalDate getNascimento() {
		return nascimento;
	}

	public void setNascimento(LocalDate nascimento) {
		this.nascimento = nascimento;
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
