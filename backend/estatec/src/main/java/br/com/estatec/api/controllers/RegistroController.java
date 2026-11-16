package br.com.estatec.api.controllers;
import jakarta.servlet.http.HttpSession;
import br.com.estatec.api.config.AccessControl;

import java.util.List;

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

import br.com.estatec.api.entities.Registro;
import br.com.estatec.api.services.RegistroService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/estacionamento/registros")
public class RegistroController {

    private final AccessControl access;

    private final RegistroService service;

    public RegistroController(RegistroService service, AccessControl access) {
        this.service = service;
        this.access = access;
    }

    @GetMapping
    public ResponseEntity<List<Registro>> listar(HttpSession session) {
        return ResponseEntity.ok(service.listarTodos().stream()
            .filter(r -> access.isAdmin(session) || access.userId(session).equals(r.getUsuario().getId()))
            .toList());
    }

    @PostMapping
    public ResponseEntity<Registro> criar(@Valid @RequestBody Registro request, HttpSession session) {
        if (!access.isAdmin(session)) request.setUsuario(access.currentUser(session));
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Registro> atualizar(@PathVariable("id") Long id, @Valid @RequestBody Registro request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
