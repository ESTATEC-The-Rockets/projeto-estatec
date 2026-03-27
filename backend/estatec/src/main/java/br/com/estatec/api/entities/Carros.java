package br.com.estatec.api.entities;

import br.com.estatec.api.enums.Cor;
import br.com.estatec.api.validations.annotations.Placa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_carros")
public class Carros {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idCarros;

	@Size(min = 3, max = 15, message = "O nome da marca deve ter de 3 a 15 letras.")
	@NotBlank(message = "A marca não pode ficar em branco.")
	private String marca;

	@Size(min = 2, max = 50, message = "O nome do modelo do carro deve ter de 2 a 50 caracteres.")
	@NotBlank(message = "O modelo não pode ficar em branco.")
	private String modelo;

	@Placa
	@Column(unique = true, length = 8)
	@NotBlank(message = "A placa não pode estar vazia")
	private String placa;

	// _________________________________________________

	@Enumerated(EnumType.STRING)
	private Cor cor;

	// __________________________________________________

	public Carros() {

	}

	public Carros(String marca, String modelo, String placa, Cor cor) {
		this.marca = marca;
		this.modelo = modelo;
		this.placa = placa;
		this.cor = cor;
	}

	public Long getIdCarros() {
		return idCarros;
	}

	public void setIdCarros(Long idCarros) {
		this.idCarros = idCarros;
	}

	public String getMarca() {
		return marca;
	}

	public void setMarca(String marca) {
		this.marca = marca;
	}

	public String getModelo() {
		return modelo;
	}

	public void setModelo(String modelo) {
		this.modelo = modelo;
	}

	public String getPlaca() {
		return placa;
	}

	public void setPlaca(String placa) {
		this.placa = placa;
	}

	public Cor getCor() {
		return cor;
	}

	public void setCor(Cor cor) {
		this.cor = cor;
	}
}
