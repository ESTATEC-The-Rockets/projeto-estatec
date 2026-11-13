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
import br.com.estatec.api.services.CarroService;
import br.com.estatec.api.services.EstacionamentoService;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/estacionamento/registros")
public class RegistroController {

    private final AccessControl access;

    private final RegistroService service;
    private final CarroService carros;
    private final EstacionamentoService estacionamentos;

    public RegistroController(RegistroService service, AccessControl access,
            CarroService carros, EstacionamentoService estacionamentos) {
        this.service = service;
        this.access = access;
        this.carros = carros;
        this.estacionamentos = estacionamentos;
    }

    @GetMapping
    public ResponseEntity<List<Registro>> listar(HttpSession session) {
        return ResponseEntity.ok(service.listarTodos().stream()
            .filter(r -> access.isAdmin(session) || (r.getEstacionamento() != null
                && r.getEstacionamento().getUsuario() != null
                && access.userId(session).equals(r.getEstacionamento().getUsuario().getId())))
            .toList());
    }

    @PostMapping
    public ResponseEntity<Registro> criar(@Valid @RequestBody Registro request, HttpSession session) {
        validateOwnership(request, session);
        request.setUsuario(access.currentUser(session));
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Registro> atualizar(@PathVariable("id") Long id, @Valid @RequestBody Registro request, HttpSession session) {
        access.requireOwner(service.buscarPorId(id).getEstacionamento().getUsuario(), session);
        validateOwnership(request, session);
        request.setUsuario(access.currentUser(session));
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id, HttpSession session) {
        access.requireOwner(service.buscarPorId(id).getEstacionamento().getUsuario(), session);
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private void validateOwnership(Registro request, HttpSession session) {
        if (request.getEstacionamento() == null || request.getEstacionamento().getIdEstacionamento() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estacionamento é obrigatório.");
        }
        access.requireOwner(estacionamentos.buscarPorId(request.getEstacionamento().getIdEstacionamento()).getUsuario(), session);
        if (request.getCarro() != null && request.getCarro().getIdCarros() != null) {
            access.requireOwner(carros.buscarPorId(request.getCarro().getIdCarros()).getUsuario(), session);
        }
    }
}
