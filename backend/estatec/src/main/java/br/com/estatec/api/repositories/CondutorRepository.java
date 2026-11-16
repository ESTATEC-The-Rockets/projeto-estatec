package br.com.estatec.api.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.Condutor;

@Repository
public interface CondutorRepository extends JpaRepository<Condutor, Long>{
    boolean existsByCpfOrEmailOrTelefone(String cpf, String email, String telefone);

	
	Optional <Condutor> findByEmail(String email);
	
	Optional <Condutor> findByTelefone(String telefone);
	

	
	Optional <Condutor> findByCpf(String cpf);
	
	List<Condutor> findByNomeContainingIgnoreCase(String nome);

}