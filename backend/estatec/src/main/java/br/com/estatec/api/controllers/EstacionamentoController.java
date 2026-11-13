package br.com.estatec.api.controllers;
import jakarta.servlet.http.HttpSession;
import br.com.estatec.api.config.AccessControl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.services.EstacionamentoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/estacionamento") // endpoint
public class EstacionamentoController {
	@Autowired
	private AccessControl access;
	
	// variavel que herda todas as funcões da classe "Service"
	@Autowired
	private EstacionamentoService service;
	
	// Método para listar todos estacionamentos registrados 
	@GetMapping
	public ResponseEntity<List<Estacionamento>> listar(HttpSession session){
		return ResponseEntity.ok(service.listarTodos().stream()
			.filter(e -> access.isAdmin(session) || (e.getUsuario() != null && access.userId(session).equals(e.getUsuario().getId())))
			.toList());
	}
	
	// Método para buscar os estacionamentos pelo id
	@GetMapping("/{id}")
	public ResponseEntity<Estacionamento> buscar(@PathVariable Long id, HttpSession session) {
	    Estacionamento estacionamento = service.buscarPorId(id);   
	    access.requireOwnerOrAdmin(estacionamento.getUsuario(), session);
	    
	    return ResponseEntity.ok(estacionamento);
	}
	
	//Método para registrar o estacionamento no sistema
	@PostMapping
	public ResponseEntity<Estacionamento> criar(@Valid @RequestBody Estacionamento estacionamento, HttpSession session){
		estacionamento.setUsuario(access.currentUser(session));
		Estacionamento novoEstacionamento = service.salvar(estacionamento);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoEstacionamento);
	}
	
	// Método para editar/atualizar o estacionamento ja registrado já
	@PutMapping("/{id}")
	public ResponseEntity<Estacionamento> atualizar(@PathVariable Long id, @Valid @RequestBody Estacionamento estacionamento, HttpSession session){
		access.requireOwner(service.buscarPorId(id).getUsuario(), session);
		estacionamento.setUsuario(access.currentUser(session));
		Estacionamento estacionamentoAtualizado = service.atualizar(id, estacionamento);
		if (estacionamentoAtualizado != null) {
			return ResponseEntity.ok(estacionamentoAtualizado);
		}
		return ResponseEntity.notFound().build();
	}
	
	// Método para deletar estacionamentos registrados do sistema
	@DeleteMapping("/{id}")
	public ResponseEntity<Object> deletar(@PathVariable Long id, HttpSession session) {
	    access.requireOwner(service.buscarPorId(id).getUsuario(), session);
	    
	    service.deletar(id);
	    
	    return ResponseEntity.status(HttpStatus.OK)
	            .body("Sucesso: O estacionamento foi excluído permanentemente!");
	}

}
