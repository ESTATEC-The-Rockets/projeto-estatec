package br.com.estatec.api.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.DonoCarro;
import br.com.estatec.api.services.DonoCarroService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/donos-carro")
public class DonoCarroController {
	
	@Autowired
    private DonoCarroService service;

    @PostMapping
    public ResponseEntity<DonoCarro> criar(@RequestBody @Valid DonoCarro donoCarro) {
    	DonoCarro novoDono = service.salvar(donoCarro);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoDono);
    }

    @GetMapping
    public ResponseEntity<List<DonoCarro>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonoCarro> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}