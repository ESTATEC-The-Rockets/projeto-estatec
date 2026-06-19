package br.com.estatec.api.entities;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.PastOrPresent;

@Entity
@Table(name = "tb_historico") // 
public class Historico {
	
	// Atributos necessários para a entidade e suas restrições e validações
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	// Relacionamento entre a entidade "Carro" e a entidade "Histórico"
	@ManyToOne
	@JoinColumn(name = "fk_carro")
	private Carro carro;
	
	// Relacionamento entre a entidade "Estacionamento" e a entidade "Histórico"
	@ManyToOne
	@JoinColumn(name = "fk_estacionamento")
	private Estacionamento estacionamento;
	
	@PastOrPresent
	@Column(name = "dia")
	private LocalDate data; 	
	
	@Column(name = "horario_entrada")
	private LocalTime horarioEntrada;

	@Column(name = "horario_saida")
	private LocalTime horarioSaida;
	
	@Column(name = "calculo_entrada")
	private boolean entrada;
	
	
	// Métodos construtores da entidade
	public Historico(){
		
	}
	
	public Historico(Long id, Carro carro, Estacionamento estacionamento, LocalDate data, LocalTime horarioEntrada, LocalTime horarioSaida, boolean entrada) {
	    this.id = id;
	    this.carro = carro;
	    this.estacionamento = estacionamento;
	    this.data = data;
	    this.horarioEntrada = horarioEntrada;
	    this.horarioSaida = horarioSaida;
	    this.entrada = entrada;
	}

	// Getters e setters da entidade 
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Carro getCarro() {
		return carro;
	}

	public void setCarro(Carro carro) {
		this.carro = carro;
	}

	public Estacionamento getEstacionamento() {
		return estacionamento;
	}

	public void setEstacionamento(Estacionamento estacionamento) {
		this.estacionamento = estacionamento;
	}

	public LocalDate getData() {
		return data;
	}

	public void setData(LocalDate data) {
		this.data = data;
	}

	public LocalTime getHorarioEntrada() {
		return horarioEntrada;
	}

	public void setHorarioEntrada(LocalTime horarioEntrada) {
		this.horarioEntrada = horarioEntrada;
	}

	public LocalTime getHorarioSaida() {
		return horarioSaida;
	}

	public void setHorarioSaida(LocalTime horarioSaida) {
		this.horarioSaida = horarioSaida;
	}

	public boolean isEntrada() {
		return entrada;
	}

	public void setEntrada(boolean entrada) {
		this.entrada = entrada;
	}
	
}
