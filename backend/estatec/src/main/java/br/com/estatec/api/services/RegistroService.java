package br.com.estatec.api.services;

import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import br.com.estatec.api.dto.RegistroDTO;
import br.com.estatec.api.dto.RegistroRequest;
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
    public List<RegistroDTO> listarTodos() { return repository.listarDTOs(); }

    @Transactional
    public RegistroDTO criar(RegistroRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        Estacionamento estacionamento = estacionamentoRepository.findById(request.estacionamentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estacionamento não encontrado."));
        Carro carro = null;
        if (request.carroId() != null) {
            carro = carroRepository.findById(request.carroId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carro não encontrado."));
            if (carro.getUsuario() == null || !request.usuarioId().equals(carro.getUsuario().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O carro selecionado não pertence ao usuário.");
            }
        }
        boolean duplicated = request.carroId() == null
                ? repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamento(request.usuarioId(), request.estacionamentoId())
                : repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarros(
                        request.usuarioId(), request.estacionamentoId(), request.carroId());
        if (duplicated) throw new ResponseStatusException(HttpStatus.CONFLICT, "Este cadastro já existe.");
        try {
            Registro registro = repository.saveAndFlush(new Registro(usuario, estacionamento, carro));
            return new RegistroDTO(registro.getId(), usuario.getId(), estacionamento.getIdEstacionamento(), carro == null ? null : carro.getIdCarros());
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não foi possível criar o cadastro por conflito de integridade.", exception);
        }
    }

    @Transactional
    public void deletar(Long id) {
        Registro registro = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cadastro não encontrado."));
        repository.delete(registro);
    }

    @Transactional
    public RegistroDTO atualizar(Long id, RegistroRequest request) {
        Registro atual = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cadastro não encontrado."));
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        Estacionamento estacionamento = estacionamentoRepository.findById(request.estacionamentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estacionamento não encontrado."));
        Carro carro = request.carroId() == null ? null : carroRepository.findById(request.carroId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carro não encontrado."));
        if (carro != null && (carro.getUsuario() == null || !request.usuarioId().equals(carro.getUsuario().getId()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O carro selecionado não pertence ao usuário.");
        }
        if (request.carroId() != null && repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamentoAndCarro_IdCarrosAndIdNot(
                request.usuarioId(), request.estacionamentoId(), request.carroId(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este cadastro já existe.");
        }
        atual.setUsuario(usuario);
        atual.setEstacionamento(estacionamento);
        atual.setCarro(carro);
        Registro salvo = repository.saveAndFlush(atual);
        return new RegistroDTO(salvo.getId(), usuario.getId(), estacionamento.getIdEstacionamento(), carro == null ? null : carro.getIdCarros());
    }
}
