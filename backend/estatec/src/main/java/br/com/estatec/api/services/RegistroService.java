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
import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.UsuarioRepository;

@Service
public class RegistroService {
    private final RegistroRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final EstacionamentoRepository estacionamentoRepository;
    private final CarroRepository carroRepository;

    public RegistroService(RegistroRepository repository, UsuarioRepository usuarioRepository,
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
        Usuario usuario = buscarUsuario(usuarioId);
        Estacionamento estacionamento = buscarEstacionamento(estacionamentoId);
        Carro carro = carroId == null ? null : buscarCarro(carroId);
        validarCarroDoUsuario(carro, usuarioId);

        boolean duplicado = carroId == null
                ? repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamento(usuarioId, estacionamentoId)
                : repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarros(
                        usuarioId, estacionamentoId, carroId);
        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este registro já existe.");
        }

        request.setUsuario(usuario);
        request.setEstacionamento(estacionamento);
        request.setCarro(carro);
        try {
            return repository.saveAndFlush(request);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não foi possível criar o registro por conflito de integridade.", exception);
        }
    }

    @Transactional
    public void deletar(Long id) {
        Registro registro = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado."));
        repository.delete(registro);
    }

    @Transactional
    public Registro atualizar(Long id, Registro request) {
        Registro atual = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado."));
        Long usuarioId = usuarioId(request);
        Long estacionamentoId = estacionamentoId(request);
        Long carroId = carroId(request);
        Usuario usuario = buscarUsuario(usuarioId);
        Estacionamento estacionamento = buscarEstacionamento(estacionamentoId);
        Carro carro = carroId == null ? null : buscarCarro(carroId);
        validarCarroDoUsuario(carro, usuarioId);

        if (carroId != null && repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarrosAndIdNot(
                usuarioId, estacionamentoId, carroId, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este registro já existe.");
        }

        atual.setUsuario(usuario);
        atual.setEstacionamento(estacionamento);
        atual.setCarro(carro);
        return repository.saveAndFlush(atual);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O carro selecionado não pertence ao usuário.");
        }
    }

    private Long usuarioId(Registro registro) {
        if (registro == null || registro.getUsuario() == null || registro.getUsuario().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário é obrigatório.");
        }
        return registro.getUsuario().getId();
    }

    private Long estacionamentoId(Registro registro) {
        if (registro == null || registro.getEstacionamento() == null
                || registro.getEstacionamento().getIdEstacionamento() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estacionamento é obrigatório.");
        }
        return registro.getEstacionamento().getIdEstacionamento();
    }

    private Long carroId(Registro registro) {
        return registro != null && registro.getCarro() != null ? registro.getCarro().getIdCarros() : null;
    }
}
