package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Historico;

public interface HistoricoRepository extends JpaRepository<Historico, Long>{
    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"carro", "carro.usuario", "estacionamento"})
    java.util.List<Historico> findAll();



}
