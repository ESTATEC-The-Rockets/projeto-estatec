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

import br.com.estatec.api.entities.DonoEstacionamento;
import br.com.estatec.api.services.DonoEstacionamentoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/donos-estacionamento")
public class DonoEstacionamentoController {

    @Autowired
    private DonoEstacionamentoService service;

    @PostMapping
    public ResponseEntity<DonoEstacionamento> criar(@RequestBody @Valid DonoEstacionamento dono) {
        DonoEstacionamento novoDono = service.salvar(dono);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoDono);
    }

    @GetMapping
    public ResponseEntity<List<DonoEstacionamento>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonoEstacionamento> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}