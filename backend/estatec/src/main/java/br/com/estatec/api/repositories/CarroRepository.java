package br.com.estatec.api.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Carro;

public interface CarroRepository extends JpaRepository<Carro, Long> {
    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"usuario"})
    java.util.List<Carro> findAll();


    boolean existsByUsuario_IdUsuario(Long id);

	Optional<Carro> findByPlaca(String placa);


}