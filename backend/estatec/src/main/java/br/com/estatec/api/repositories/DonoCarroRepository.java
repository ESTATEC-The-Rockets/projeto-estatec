package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.DonoCarro;

@Repository
public interface DonoCarroRepository extends JpaRepository<DonoCarro, Long>{

}
