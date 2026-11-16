package br.com.estatec.api.controllers;
import jakarta.servlet.http.HttpSession;
import br.com.estatec.api.config.AccessControl;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.services.HistoricoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/historico")
public class HistoricoController {
	@Autowired
	private AccessControl access;
	
	@Autowired
	private HistoricoService service;
	
	@GetMapping 
	public ResponseEntity<List<Historico>> listar(HttpSession session) {
		
		return ResponseEntity.ok(service.listarTodos().stream()
			.filter(h -> podeVer(h, session)).toList());
		
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Historico> buscar(@PathVariable Long id, HttpSession session){
		
		Historico historico = service.buscarPorId(id);
		if (!podeVer(historico, session)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
	
		return ResponseEntity.ok(historico);
	}
	
	
	@PostMapping
	public ResponseEntity<Historico> criar(@Valid @RequestBody Historico historico){
		
		Historico historicoCriado = service.criar(historico);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(historicoCriado);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Historico> atualizar(@PathVariable Long id, @Valid @RequestBody Historico historico){
		return ResponseEntity.ok(service.atualizar(id, historico));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id){
		service.deletar(id);
		return ResponseEntity.noContent().build();
	}

	private boolean podeVer(Historico historico, HttpSession session) {
		if (access.isAdmin(session)) return true;
		Long userId = access.userId(session);
		return (historico.getCarro() != null && historico.getCarro().getUsuario() != null
				&& userId.equals(historico.getCarro().getUsuario().getId()))
			|| (historico.getEstacionamento() != null && historico.getEstacionamento().getUsuario() != null
				&& userId.equals(historico.getEstacionamento().getUsuario().getId()));
	}
	
}
