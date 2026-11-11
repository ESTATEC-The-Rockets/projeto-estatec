package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.Estacionamento;

@Repository
public interface EstacionamentoRepository extends JpaRepository<Estacionamento, Long>{

	Estacionamento findByNomeEstacionamento(String nomeEstacionamento);

	@Modifying
	@Query("update Estacionamento e set e.usuario = null where e.usuario.idUsuario = :usuarioId")
	int limparDono(@Param("usuarioId") Long usuarioId);
	
}
