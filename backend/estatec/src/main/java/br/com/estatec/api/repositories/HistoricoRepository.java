package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Historico;

public interface HistoricoRepository extends JpaRepository<Historico, Long>{

	//isso vai contar quantas vezes o dono do carro ja passou
	long countByDonoCarroId(Long donoCarroId);

}
