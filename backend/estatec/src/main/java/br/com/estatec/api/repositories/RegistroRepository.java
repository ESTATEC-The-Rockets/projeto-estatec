package br.com.estatec.api.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.estatec.api.dto.RegistroDTO;
import br.com.estatec.api.entities.Registro;

public interface RegistroRepository extends JpaRepository<Registro, Long> {

    @Query("select new br.com.estatec.api.dto.RegistroDTO("
            + "m.id, m.usuario.idUsuario, m.estacionamento.idEstacionamento, m.carro.idCarros) "
            + "from Registro m order by m.id")
    List<RegistroDTO> listarDTOs();

    boolean existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamento(
            Long usuarioId, Long estacionamentoId);

    boolean existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarros(
            Long usuarioId, Long estacionamentoId, Long carroId);

    boolean existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarrosAndIdNot(
            Long usuarioId, Long estacionamentoId, Long carroId, Long id);

    @Modifying
    @Query("delete from Registro m where m.usuario.idUsuario = :usuarioId")
    int deletarPorUsuario(@Param("usuarioId") Long usuarioId);
}
