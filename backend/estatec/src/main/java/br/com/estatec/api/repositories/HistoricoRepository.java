package br.com.estatec.api.repositories;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Historico;

public interface HistoricoRepository extends JpaRepository<Historico, Long>{

	Long countByCarro_IdCarros(Long id);
	
	Historico findByData(LocalDate data);
	
	

}
