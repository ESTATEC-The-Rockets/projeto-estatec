package br.com.estatec.api.controllers;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Carro;
import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.HistoricoRepository;
import br.com.estatec.api.repositories.RegistroRepository;

@RestController
@RequestMapping("/api/acesso")
public class AcessoController {

    @Value("${estatec.access.api-key:}")
    private String apiKey;

    @Autowired
    private CarroRepository carroRepository;

    @Autowired
    private HistoricoRepository historicoRepository;

    @Autowired
    private RegistroRepository registroRepository;

    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @PostMapping("/validar")
    public ResponseEntity<?> validarAcesso(@RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-API-Key", required = false) String suppliedKey) {
        if (apiKey.isBlank() || suppliedKey == null || !MessageDigest.isEqual(
                apiKey.getBytes(StandardCharsets.UTF_8), suppliedKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chave de acesso inválida.");
        }
        String placa = payload.get("placa");
        String estacionamentoId = payload.get("estacionamentoId");
        if (placa == null || placa.isBlank() || estacionamentoId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe placa e estacionamentoId.");
        }
        Long id;
        try {
            id = Long.valueOf(estacionamentoId);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "estacionamentoId inválido.");
        }
        var estacionamento = estacionamentoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estacionamento não encontrado."));
        Optional<Carro> carroOpt = carroRepository.findByPlaca(placa);

        boolean autorizado = carroOpt.isPresent() && registroRepository
            .existsByEstacionamento_IdEstacionamentoAndCarro_IdCarros(id, carroOpt.get().getIdCarros());

        Historico historico = new Historico();
        historico.setPlacaLida(placa);
        historico.setCarro(carroOpt.orElse(null));
        historico.setDataHora(LocalDateTime.now());
        historico.setEntrada(true);
        historico.setAutorizado(autorizado);
        
        historico.setEstacionamento(estacionamento);

        historicoRepository.save(historico);

        return ResponseEntity.ok(Map.of(
            "placa", placa,
            "autorizado", autorizado,
            "mensagem", autorizado ? "ACESSO LIBERADO" : "ACESSO NEGADO"
        ));
    }
}
