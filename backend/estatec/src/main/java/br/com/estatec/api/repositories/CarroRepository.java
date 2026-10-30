package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.Carro;

@Repository
public interface CarroRepository extends JpaRepository<Carro, Long> {


	Carro findByPlaca(String placa);

	@Modifying
	@Query("update Carro c set c.usuario = null where c.usuario.idUsuario = :usuarioId")
	int limparDono(@Param("usuarioId") Long usuarioId);
}
