package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.DonoCarro;

public interface DonoCarroRepository extends JpaRepository<DonoCarro, Long>{

}
