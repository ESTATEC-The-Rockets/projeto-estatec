package br.com.estatec.api.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "tb_registro", uniqueConstraints = @UniqueConstraint(
        name = "uk_registro_usuario_estacionamento",
        columnNames = {"fk_usuario", "fk_estacionamento", "fk_carro"}))
public class Registro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_estacionamento", nullable = false)
    private Estacionamento estacionamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_carro")
    private Carro carro;

    public Registro() {
    }

    public Registro(Usuario usuario, Estacionamento estacionamento) {
        this.usuario = usuario;
        this.estacionamento = estacionamento;
    }

    public Registro(Usuario usuario, Estacionamento estacionamento, Carro carro) {
        this.usuario = usuario;
        this.estacionamento = estacionamento;
        this.carro = carro;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Estacionamento getEstacionamento() {
        return estacionamento;
    }

    public void setEstacionamento(Estacionamento estacionamento) {
        this.estacionamento = estacionamento;
    }

    public Carro getCarro() {
        return carro;
    }

    public void setCarro(Carro carro) {
        this.carro = carro;
    }
}
