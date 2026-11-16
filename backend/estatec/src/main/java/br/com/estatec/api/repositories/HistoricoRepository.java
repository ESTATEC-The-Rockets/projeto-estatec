package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Historico;

public interface HistoricoRepository extends JpaRepository<Historico, Long>{
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("update Historico h set h.carro = null where h.carro.idCarros = :id")
    int limparCarro(@org.springframework.data.repository.query.Param("id") Long id);

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"carro", "carro.usuario", "estacionamento"})
    java.util.List<Historico> findAll();



}
