package br.com.estatec.api.controllers;

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

import br.com.estatec.api.entities.Carros;
import br.com.estatec.api.services.CarrosService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/carros")
public class CarrosController {

    @Autowired
    private CarrosService service;

    @GetMapping
    public ResponseEntity<List<Carros>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carros> buscar(@PathVariable Long id) {
        Carros carro = service.buscarPorId(id);
        return ResponseEntity.ok(carro);
    }

    @PostMapping
    public ResponseEntity<Carros> criar(@Valid @RequestBody Carros carro) {
        Carros novoCarro = service.salvar(carro);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoCarro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Carros> atualizar(@PathVariable Long id, @Valid @RequestBody Carros carro) {
        Carros carroAtualizado = service.atualizar(id, carro);
        return ResponseEntity.ok(carroAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        service.buscarPorId(id); 
        
        service.deletar(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body("Sucesso: O carro foi excluído permanentemente!");
    }
}