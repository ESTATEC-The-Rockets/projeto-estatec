package br.com.estatec.api.controllers;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Carro;
import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.HistoricoRepository;

@RestController
@RequestMapping("/api/acesso")
@CrossOrigin(origins = "*")
public class AcessoController {

    @Autowired
    private CarroRepository carroRepository;

    @Autowired
    private HistoricoRepository historicoRepository;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @PostMapping("/validar")
    public ResponseEntity<?> validarAcesso(@RequestBody Map<String, String> payload) {
        String placa = payload.get("placa");
        Optional<Carro> carroOpt = carroRepository.findByPlaca(placa);

        boolean autorizado = carroOpt.isPresent();

        Historico historico = new Historico();
        historico.setPlacaLida(placa);
        historico.setCarro(carroOpt.orElse(null));
        historico.setDataHora(LocalDateTime.now());
        historico.setEntrada(true);
        historico.setAutorizado(autorizado);
        
        estacionamentoRepository.findById(1L).ifPresent(historico::setEstacionamento);

        historicoRepository.save(historico);

        return ResponseEntity.ok(Map.of(
            "placa", placa,
            "autorizado", autorizado,
            "mensagem", autorizado ? "ACESSO LIBERADO" : "ACESSO NEGADO"
        ));
    }
}