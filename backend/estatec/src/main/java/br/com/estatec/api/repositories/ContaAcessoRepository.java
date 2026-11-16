package br.com.estatec.api.repositories;
import java.util.Optional;
import br.com.estatec.api.entities.ContaAcesso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ContaAcessoRepository extends JpaRepository<ContaAcesso, Long> {
    Optional<ContaAcesso> findByEmail(String email);
    boolean existsByEmail(String email);
}
