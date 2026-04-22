package br.com.estatec.api.entities;

import java.time.LocalDate;

	import org.hibernate.validator.constraints.br.CPF;

	import com.fasterxml.jackson.annotation.JsonBackReference;

	import jakarta.persistence.Column;
	import jakarta.persistence.Entity;
	import jakarta.persistence.GeneratedValue;
	import jakarta.persistence.GenerationType;
	import jakarta.persistence.Id;
	import jakarta.persistence.OneToOne;
	import jakarta.persistence.Table;
	import jakarta.validation.constraints.NotBlank;
	import jakarta.validation.constraints.NotNull;
	import jakarta.validation.constraints.PastOrPresent;
	import jakarta.validation.constraints.Pattern;
	import jakarta.validation.constraints.Size;

	@Entity
	@Table(name = "tb_documentos")
	public class Documentos {

		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		private Long id;

		@NotBlank(message = "O CPF é obrigatório.")
		@CPF(message = "O CPF é inválido.")
		@Column(nullable = false, unique = true, length = 14)
		private String cpf;

		@NotBlank(message = "O orgão emissor é obrigatório.")
		@Size(min = 2, max = 20, message = "Orgão emissor deve ter entre 2 e 20 caracteres.")
		@Column(nullable = false, length = 20)
		private String orgaoEmissor;

		@NotBlank(message = "UF é obrigatório.")
		@Pattern(regexp = "^[A-Z]{2}$", message = "UF deve ter 2 letras maiúsculas.")
		@Column(nullable = false, length = 2)
		private String uf;

		@NotNull(message = "Data de emissão é obrigatória.")
		@PastOrPresent(message = "Data de emissão não pode ser no futuro.")
		private LocalDate dataEmissao;

		
		@NotBlank(message = "O RG é obrigatório.")
		@Pattern(regexp = "^[A-Za-z0-9.-]+$", 
				 message = "RG deve conter apenas números, letras, ponto e hífen.")			
		@Size(min = 7, max = 12, message = "RG deve ter pelo menos 7 dígitos.") 
		@Column(nullable = false, unique = true, length = 12)
		private String rg;

		@OneToOne(mappedBy = "documentos")
		@JsonBackReference 
		private Carros carro;
		
		
		public Documentos() {
		}

		public Documentos(String cpf, String rg, Carros carro, String orgaoEmissor, String uf, LocalDate dataEmissao) {
			this.cpf = cpf;
			this.rg = rg;
			this.carro = carro;
			this.orgaoEmissor = orgaoEmissor;
			this.uf = uf;
			this.dataEmissao = dataEmissao;

		}

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public String getCpf() {
			return cpf;
		}

		public void setCpf(String cpf) {
			this.cpf = cpf;
		}

		public String getRg() {
			return rg;
		}

		public void setRg(String rg) {
			this.rg = rg;
		}

		public Carros getCarros() {
			return carro;
		}

		public void setCarros(Carros carro) {
			this.carro = carro;
		}

		public String getOrgaoEmissor() {
			return orgaoEmissor;
		}

		public void setOrgaoEmissor(String orgaoEmissor) {
			this.orgaoEmissor = orgaoEmissor;
		}

		public String getUf() {
			return uf;
		}

		public void setUf(String uf) {
			this.uf = uf;
		}

		public LocalDate getDataEmissao() {
			return dataEmissao;
		}

		public void setDataEmissao(LocalDate dataEmissao) {
			this.dataEmissao = dataEmissao;
		}
	}

