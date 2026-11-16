package br.com.estatec.api.controllers;

import java.util.List;
import br.com.estatec.api.entities.Condutor;
import br.com.estatec.api.services.CondutorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/condutores", "/usuarios"})
public class CondutorController {
    private final CondutorService service;
    public CondutorController(CondutorService service) { this.service = service; }
    @GetMapping
    public List<Condutor> listar() { return service.listarTodos(); }
    @GetMapping("/{id}")
    public ResponseEntity<Condutor> buscar(@PathVariable Long id) {
        return service.buscarPorId(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PostMapping({"", "/cadastro"})
    public ResponseEntity<Condutor> cadastrar(@Valid @RequestBody Condutor condutor) {
        condutor.setId(null);
        return ResponseEntity.status(201).body(service.salvar(condutor));
    }
    @PutMapping("/{id}")
    public Condutor atualizar(@PathVariable Long id, @Valid @RequestBody Condutor condutor) {
        return service.atualizar(id, condutor);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.deletar(id); return ResponseEntity.noContent().build();
    }
}
