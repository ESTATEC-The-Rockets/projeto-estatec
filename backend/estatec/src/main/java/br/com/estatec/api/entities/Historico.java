package br.com.estatec.api.entities;

import java.time.LocalTime;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.PastOrPresent;

@Entity
@Table(name = "tb_historico") 
public class Historico {
	
	@Id
	@GeneratedValue
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "fk_dono_carro")
	private DonoCarro donoCarro;
	
	@ManyToOne
	@JoinColumn(name = "fk_estacionamento")
	private Estacionamento estacionamento;
	
	@PastOrPresent
	@Column(name = "dia")
	private Date data; 	
	
	@Column(name = "horario_entrada")
	private LocalTime horarioEntrada;

	@Column(name = "horario_saida")
	private LocalTime horarioSaida;
	
	@Column(name = "calculo_entrada")
	private boolean entrada;
	
	
	
	
	public Historico(){
		
	}
	
	public Historico(Long id, DonoCarro donoCarro, Estacionamento estacionamento, Date data, LocalTime horarioEntrada, LocalTime horarioSaida, boolean entrada) {
		this.data = data;
		this.donoCarro = donoCarro;
		this.estacionamento = estacionamento;
		this.horarioEntrada = horarioEntrada;
		this.horarioSaida = horarioSaida;
		this.entrada = entrada;
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public DonoCarro getDonoCarro() {
		return donoCarro;
	}

	public void setDonoCarro(DonoCarro donoCarro) {
		this.donoCarro = donoCarro;
	}

	public Estacionamento getEstacionamento() {
		return estacionamento;
	}

	public void setEstacionamento(Estacionamento estacionamento) {
		this.estacionamento = estacionamento;
	}

	public Date getData() {
		return data;
	}

	public void setData(Date data) {
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
	
	

}
