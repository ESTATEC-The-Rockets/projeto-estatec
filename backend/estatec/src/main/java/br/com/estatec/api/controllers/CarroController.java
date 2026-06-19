package br.com.estatec.api.controllers;

import java.util.List;

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

import br.com.estatec.api.entities.Carro;
import br.com.estatec.api.services.CarroService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/carros") // endpoint
@CrossOrigin("*") // Libera o acesso para qualquer origem
public class CarroController {

	// variavel que herda todas as funções da classe "Service"
    @Autowired
    private CarroService service;

    // Método para listar todos carros registrados 
    @GetMapping
    public ResponseEntity<List<Carro>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // Método para buscar os carros pelo id
    @GetMapping("/{id}")
    public ResponseEntity<Carro> buscar(@PathVariable Long id) {
        Carro carro = service.buscarPorId(id);
        return ResponseEntity.ok(carro);
    }

    // Método para registrar o carro no sistema
    @PostMapping
    public ResponseEntity<Carro> criar(@Valid @RequestBody Carro carro) {
        Carro novoCarro = service.salvar(carro);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoCarro);
    }

    // Método para editar/atualizar o carro ja registrado já
    @PutMapping("/{id}")
    public ResponseEntity<Carro> atualizar(@PathVariable Long id, @Valid @RequestBody Carro carro) {
        Carro carroAtualizado = service.atualizar(id, carro);
        return ResponseEntity.ok(carroAtualizado);
    }

    // Método para deletar carros registrados do sistema
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        service.buscarPorId(id); 
        
        service.deletar(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body("Sucesso: O carro foi excluído permanentemente!");
    }
}