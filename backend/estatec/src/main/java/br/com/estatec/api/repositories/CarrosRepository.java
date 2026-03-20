package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Carros;

public interface CarrosRepository extends JpaRepository<Carros, Long> {

}
