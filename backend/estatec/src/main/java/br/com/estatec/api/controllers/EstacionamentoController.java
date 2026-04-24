package br.com.estatec.api.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@RequestMapping("/api/estacionamento")
@CrossOrigin("*")
public class EstacionamentoController {
	
	@Autowired
	private EstacionamentoService service;
	
	@GetMapping
	public ResponseEntity<List<Estacionamento>> listar(){
		return ResponseEntity.ok(service.listarTodos());
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Estacionamento> buscar(@PathVariable Long id){
		Optional<Estacionamento> estacionamento = service.buscarPorId(id);
		
		if (estacionamento.isPresent()) {
			return ResponseEntity.ok(estacionamento.get());
		}
		return ResponseEntity.notFound().build();
	}
	
	@PostMapping
	public ResponseEntity<Estacionamento> criar(@Valid @RequestBody Estacionamento estacionamento){
		Estacionamento novoEstacionamento = service.salvar(estacionamento);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoEstacionamento);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Estacionamento> atualizar(@PathVariable Long id, @Valid @RequestBody Estacionamento estacionamento){
		Estacionamento estacionamentoAtualizado = service.atualizar(id, estacionamento);
		if (estacionamentoAtualizado != null) {
			return ResponseEntity.ok(estacionamentoAtualizado);
		}
		return ResponseEntity.notFound().build();
	}
	

}
