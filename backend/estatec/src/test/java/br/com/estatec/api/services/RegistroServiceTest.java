package br.com.estatec.api.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import br.com.estatec.api.dto.RegistroDTO;
import br.com.estatec.api.dto.RegistroRequest;
import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.entities.Registro;
import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class RegistroServiceTest {

    @Mock private RegistroRepository repository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EstacionamentoRepository estacionamentoRepository;
    @InjectMocks private RegistroService service;

    private Usuario usuario;
    private Estacionamento estacionamento;
    private final RegistroRequest request = new RegistroRequest(1L, 2L);

    @BeforeEach
    void prepararEntidades() {
        usuario = new Usuario();
        usuario.setId(1L);
        estacionamento = new Estacionamento();
        estacionamento.setIdEstacionamento(2L);
    }

    private void entidadesExistentes() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(estacionamentoRepository.findById(2L)).thenReturn(Optional.of(estacionamento));
    }

    @Test
    void listarRetornaSomenteDTOs() {
        List<RegistroDTO> lista = List.of(new RegistroDTO(3L, 1L, 2L));
        when(repository.listarDTOs()).thenReturn(lista);
        assertEquals(lista, service.listarTodos());
        verify(repository, never()).findAll();
        verifyNoInteractions(usuarioRepository, estacionamentoRepository);
    }

    @Test
    void criarVinculaEntidadesExistentesSemCadastraLas() {
        entidadesExistentes();
        when(repository.saveAndFlush(any(Registro.class))).thenAnswer(invocation -> {
            Registro registro = invocation.getArgument(0);
            assertSame(usuario, registro.getUsuario());
            assertSame(estacionamento, registro.getEstacionamento());
            registro.setId(3L);
            return registro;
        });
        assertEquals(new RegistroDTO(3L, 1L, 2L), service.criar(request));
        verify(usuarioRepository, never()).save(any());
        verify(estacionamentoRepository, never()).save(any());
    }

    @Test
    void usuarioInexistenteRetorna404() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
        verifyNoInteractions(repository, estacionamentoRepository);
    }

    @Test
    void estacionamentoInexistenteRetorna404() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(estacionamentoRepository.findById(2L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void duplicataRetorna409SemSalvar() {
        entidadesExistentes();
        when(repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamento(1L, 2L)).thenReturn(true);
        assertEquals(HttpStatus.CONFLICT,
                assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void violacaoDeIntegridadeNoFlushRetorna409() {
        entidadesExistentes();
        when(repository.saveAndFlush(any(Registro.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key"));
        assertEquals(HttpStatus.CONFLICT,
                assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
    }

    @Test
    void deletarRemoveRegistroExistente() {
        Registro registro = new Registro(usuario, estacionamento);
        when(repository.findById(3L)).thenReturn(Optional.of(registro));
        service.deletar(3L);
        verify(repository).delete(registro);
    }

    @Test
    void deletarInexistenteRetorna404() {
        when(repository.findById(3L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> service.deletar(3L)).getStatusCode());
        verify(repository, never()).delete(any());
    }
}