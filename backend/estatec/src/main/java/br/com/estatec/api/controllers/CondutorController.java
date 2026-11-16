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
    private final br.com.estatec.api.services.CarroService carros;
    public CondutorController(CondutorService service, br.com.estatec.api.services.CarroService carros) { this.service = service; this.carros = carros; }
    @PostMapping("/{id}/carros")
    public ResponseEntity<br.com.estatec.api.entities.Carro> cadastrarCarro(@PathVariable Long id, @Valid @RequestBody br.com.estatec.api.entities.Carro carro) {
        return ResponseEntity.status(201).body(carros.salvar(id, carro));
    }
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
