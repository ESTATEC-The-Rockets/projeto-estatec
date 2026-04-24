package br.com.estatec.api.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.estatec.api.entities.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
	
	Optional <Usuario> findByEmail(String email);
	
	Optional <Usuario> findByNome(String Nome);
	
	Optional <Usuario> findByTelefone(String telefone);

}
