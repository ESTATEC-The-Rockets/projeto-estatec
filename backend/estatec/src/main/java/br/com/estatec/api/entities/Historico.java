package br.com.estatec.api.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_historico")
public class Historico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "placa_lida", nullable = false)
    private String placaLida;

    @ManyToOne
    @JoinColumn(name = "fk_carro", nullable = true)
    private Carro carro;

    @ManyToOne
    @JoinColumn(name = "fk_estacionamento", nullable = false)
    private Estacionamento estacionamento;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "is_entrada")
    private boolean entrada;

    @Column(name = "autorizado", nullable = false)
    private boolean autorizado;

    public Historico() {}

    public Historico(String placaLida, Carro carro, Estacionamento estacionamento, LocalDateTime dataHora, boolean entrada, boolean autorizado) {
        this.placaLida = placaLida;
        this.carro = carro;
        this.estacionamento = estacionamento;
        this.dataHora = dataHora;
        this.entrada = entrada;
        this.autorizado = autorizado;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlacaLida() {
        return placaLida;
    }

    public void setPlacaLida(String placaLida) {
        this.placaLida = placaLida;
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

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public boolean isEntrada() {
        return entrada;
    }

    public void setEntrada(boolean entrada) {
        this.entrada = entrada;
    }

    public boolean isAutorizado() {
        return autorizado;
    }

    public void setAutorizado(boolean autorizado) {
        this.autorizado = autorizado;
    }
}