package br.com.estatec.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.services.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios") // endpoint
@CrossOrigin("*") // libera o acesso para qualquer origem
public class UsuarioController {
	
	// herda todas as funções da classe "Service"
	@Autowired
	private UsuarioService service;

	// Método para cadastrar o usuario no sistema
	@PostMapping("/cadastro")
	public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody Usuario usuario) {

		Usuario usuarioSalvo = service.salvar(usuario);

		return ResponseEntity.status(HttpStatus.CREATED).body(usuarioSalvo);
	}

	// metodo para validar o login do usuário no sistema
	@PostMapping("/login")
	public ResponseEntity<Usuario> login(@RequestBody Usuario usuarioLogin){
	    try {
	        Usuario usuario = service.login(usuarioLogin.getEmail(), usuarioLogin.getSenha());
	        
	        // Se encontrou o utilizador e a senha bateu certo
	        if (usuario != null) {
	            return ResponseEntity.ok(usuario);
	        }
	        
	        // Se as credenciais estiverem erradas, devolve o erro 401 Unauthorized
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	        
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }
	}
	
	// Método para listar todos usuários registrados
	@GetMapping
	public ResponseEntity<List<Usuario>> listarTodos(){
	    return ResponseEntity.ok(service.listarTodos());
	}
	
	// Método para buscar os usuários pelo id
	@GetMapping("/{id}")
	public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id){

	    return service.buscarPorId(id)
	            .map(ResponseEntity::ok)
	            .orElse(ResponseEntity.notFound().build());
	}
	
	// Método para editar/atualizar o usuário ja registrado já
	@PutMapping("/{id}")
	public ResponseEntity<Usuario> atualizar(
	        @PathVariable Long id,
	        @Valid @RequestBody Usuario usuario){

	    Usuario atualizado = service.atualizar(id, usuario);

	    return ResponseEntity.ok(atualizado);
	}
	
	// Método para deletar usuário registrados do sistema
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id){

	    service.deletar(id);

	    return ResponseEntity.noContent().build();
	}
	
	
}