package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.Carro;

@Repository
public interface CarroRepository extends JpaRepository<Carro, Long> {


	Carro findByPlaca(String placa);
}
