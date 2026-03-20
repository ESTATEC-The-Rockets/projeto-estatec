package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.DonoEstacionamento;

@Repository
public interface DonoEstacionamentoRepository extends JpaRepository<DonoEstacionamento, Long> {

}
