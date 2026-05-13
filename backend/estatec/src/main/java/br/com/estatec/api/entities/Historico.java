package br.com.estatec.api.entities;

import java.sql.Time;
import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_historico") 
public class Historico {
	
	@Id
	@GeneratedValue
	private Long id;
	
	private DonoCarro donoCarro;
	
	private Estacionamento estacionamento;
	
	private Date date; 	
	
	private Time horarioEntrada;
	
	private Time horarioSaida;
	
	
	public Historico(){
		
	}
	
	public Historico(Long id, DonoCarro donoCarro, Estacionamento estacionamento, Date date, Time horarioEntrada, Time horarioSaida) {
		this.date = date;
		this.donoCarro = donoCarro;
		this.estacionamento = estacionamento;
		this.horarioEntrada = horarioEntrada;
		this.horarioSaida = horarioSaida;
		
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

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public Time getHorarioEntrada() {
		return horarioEntrada;
	}

	public void setHorarioEntrada(Time horarioEntrada) {
		this.horarioEntrada = horarioEntrada;
	}

	public Time getHorarioSaida() {
		return horarioSaida;
	}

	public void setHorarioSaida(Time horarioSaida) {
		this.horarioSaida = horarioSaida;
	}
	
	

}
