package br.com.estatec.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.estatec.api.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

}
