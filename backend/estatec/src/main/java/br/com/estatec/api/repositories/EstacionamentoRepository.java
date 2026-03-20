package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Estacionamento;

public interface EstacionamentoRepository extends JpaRepository<Estacionamento, Long>{

}
