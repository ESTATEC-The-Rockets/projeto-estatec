package br.com.estatec.api.services;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.com.estatec.api.entities.Carro;
import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.entities.Registro;
import br.com.estatec.api.entities.Condutor;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.CondutorRepository;

@Service
public class RegistroService {
    private final RegistroRepository repository;
    private final CondutorRepository usuarioRepository;
    private final EstacionamentoRepository estacionamentoRepository;
    private final CarroRepository carroRepository;

    public RegistroService(RegistroRepository repository, CondutorRepository usuarioRepository,
            EstacionamentoRepository estacionamentoRepository, CarroRepository carroRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.estacionamentoRepository = estacionamentoRepository;
        this.carroRepository = carroRepository;
    }

    @Transactional(readOnly = true)
    public List<Registro> listarTodos() {
        return repository.findAllByOrderByIdAsc();
    }

    @Transactional
    public Registro criar(Registro request) {
        Long usuarioId = usuarioId(request);
        Long estacionamentoId = estacionamentoId(request);
        Long carroId = carroId(request);
        Condutor usuario = buscarUsuario(usuarioId);
        Estacionamento estacionamento = buscarEstacionamento(estacionamentoId);
        Carro carro = buscarCarro(carroId);
        validarCarroDoUsuario(carro, usuarioId);

        boolean duplicado = repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarros(
                usuarioId, estacionamentoId, carroId);
        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este carro já está neste estacionamento.");
        }

        request.setUsuario(usuario);
        request.setEstacionamento(estacionamento);
        request.setCarro(carro);
        try {
            return repository.saveAndFlush(request);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este carro já está neste estacionamento.", exception);
        }
    }

    @Transactional
    public void deletar(Long id) {
        Registro registro = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "O vínculo não foi encontrado."));
        repository.delete(registro);
    }

    @Transactional
    public Registro atualizar(Long id, Registro request) {
        Registro atual = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "O vínculo não foi encontrado."));
        Long usuarioId = usuarioId(request);
        Long estacionamentoId = estacionamentoId(request);
        Long carroId = carroId(request);
        Condutor usuario = buscarUsuario(usuarioId);
        Estacionamento estacionamento = buscarEstacionamento(estacionamentoId);
        Carro carro = buscarCarro(carroId);
        validarCarroDoUsuario(carro, usuarioId);

        if (repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarrosAndIdNot(
                usuarioId, estacionamentoId, carroId, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este carro já está neste estacionamento.");
        }

        atual.setUsuario(usuario);
        atual.setEstacionamento(estacionamento);
        atual.setCarro(carro);
        return repository.saveAndFlush(atual);
    }

    private Condutor buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condutor não encontrado."));
    }

    private Estacionamento buscarEstacionamento(Long id) {
        return estacionamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estacionamento não encontrado."));
    }

    private Carro buscarCarro(Long id) {
        return carroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carro não encontrado."));
    }

    private void validarCarroDoUsuario(Carro carro, Long usuarioId) {
        if (carro != null && (carro.getUsuario() == null || !usuarioId.equals(carro.getUsuario().getId()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este carro pertence a outro condutor.");
        }
    }

    private Long usuarioId(Registro registro) {
        if (registro == null || registro.getUsuario() == null || registro.getUsuario().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um condutor.");
        }
        return registro.getUsuario().getId();
    }

    private Long estacionamentoId(Registro registro) {
        if (registro == null || registro.getEstacionamento() == null
                || registro.getEstacionamento().getIdEstacionamento() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um estacionamento.");
        }
        return registro.getEstacionamento().getIdEstacionamento();
    }

    private Long carroId(Registro registro) {
        if (registro == null || registro.getCarro() == null || registro.getCarro().getIdCarros() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um carro.");
        return registro.getCarro().getIdCarros();
    }
}
