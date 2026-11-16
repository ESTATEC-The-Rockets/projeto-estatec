package br.com.estatec.api.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.estatec.api.entities.Carro;

public interface CarroRepository extends JpaRepository<Carro, Long> {

	Optional<Carro> findByPlaca(String placa);

	@Modifying
	@Query("update Carro c set c.usuario = null where c.usuario.idUsuario = :usuarioId")
	int limparDono(@Param("usuarioId") Long usuarioId);

}