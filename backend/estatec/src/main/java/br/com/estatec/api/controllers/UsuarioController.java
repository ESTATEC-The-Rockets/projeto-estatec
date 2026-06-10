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
@RequestMapping("/usuarios")
@CrossOrigin("*")
public class UsuarioController {
	
	@Autowired
	private UsuarioService service;

	@PostMapping("/cadastro")
	public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody Usuario usuario) {

		Usuario usuarioSalvo = service.salvar(usuario);

		return ResponseEntity.status(HttpStatus.CREATED).body(usuarioSalvo);
	}

	@PostMapping("/login")
	public ResponseEntity<Usuario> login(@RequestBody Usuario usuarioLogin){
		Usuario usuario = service.login(usuarioLogin.getEmail(), usuarioLogin.getSenha());
		
		return ResponseEntity.ok(usuario);
	}
	
	@GetMapping
	public ResponseEntity<List<Usuario>> listarTodos(){
	    return ResponseEntity.ok(service.listarTodos());
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id){

	    return service.buscarPorId(id)
	            .map(ResponseEntity::ok)
	            .orElse(ResponseEntity.notFound().build());
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Usuario> atualizar(
	        @PathVariable Long id,
	        @Valid @RequestBody Usuario usuario){

	    Usuario atualizado = service.atualizar(id, usuario);

	    return ResponseEntity.ok(atualizado);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id){

	    service.deletar(id);

	    return ResponseEntity.noContent().build();
	}
	
	
}