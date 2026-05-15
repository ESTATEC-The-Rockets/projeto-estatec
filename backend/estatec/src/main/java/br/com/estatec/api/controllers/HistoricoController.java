package br.com.estatec.api.controllers;

import java.util.List;
import java.util.Optional;

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

import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.services.HistoricoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/Historico")
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
		Optional<Historico> historico = service.buscarPorId(id);
		
		if(historico.isPresent()) {
			return ResponseEntity.ok(historico.get());
		}
		return ResponseEntity.notFound().build();
	}
	
	@PostMapping
	public ResponseEntity<Historico> criar(@Valid @RequestBody Historico historico){
		Historico novoHistorico = service.salvar(historico);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoHistorico);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Historico> atualizar(@PathVariable Long id, @Valid @RequestBody Historico historico) {
		Historico historicoAtualizado = service.atualizar(id, historico);
		if (historicoAtualizado != null) {
			return ResponseEntity.ok(historicoAtualizado);
		}
		return ResponseEntity.notFound().build();
	}
	
	@DeleteMapping ("/{id}")
	public ResponseEntity<Object> deletar(@PathVariable Long id){
		Optional<Historico> historico = service.buscarPorId(id);
		
		if(historico.isPresent()) {
			service.deletar(id);
			return ResponseEntity.status(HttpStatus.OK)
					.body("Sucesso: O aluno foi excluido permanentemente");
		}
		return ResponseEntity.status(HttpStatus.OK)
				.body("Erro: Não é possível deletar. O aluno com ID " + id + " não foi encontrado.");
	}
}
