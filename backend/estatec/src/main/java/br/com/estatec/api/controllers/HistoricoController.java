package br.com.estatec.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.services.HistoricoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/historico")
@CrossOrigin("*")
public class HistoricoController {
	
	@Autowired
	private HistoricoService service;
	
	@GetMapping 
	public ResponseEntity<List<Historico>> listar() {
		
		return ResponseEntity.ok(service.listarTodos());
		
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<Historico> buscar(@PathVariable Long id){
		
		Historico historico = service.buscarPorId(id);
	
		return ResponseEntity.ok(historico);
	}
	
	
	@PostMapping
	public ResponseEntity<Historico> criar(@Valid @RequestBody Historico historico){
		
		Historico historicoCriado = service.criar(historico);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(historicoCriado);
	}
	
}