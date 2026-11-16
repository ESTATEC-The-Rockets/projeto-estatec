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

import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.entities.Registro;
import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class RegistroServiceTest {
    @Mock private RegistroRepository repository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EstacionamentoRepository estacionamentoRepository;
    @Mock private CarroRepository carroRepository;
    @InjectMocks private RegistroService service;
    private Usuario usuario;
    private Estacionamento estacionamento;
    private Registro request;

    @BeforeEach
    void prepararEntidades() {
        usuario = new Usuario(); usuario.setId(1L);
        estacionamento = new Estacionamento(); estacionamento.setIdEstacionamento(2L);
        request = new Registro(new Usuario(), new Estacionamento());
        request.getUsuario().setId(1L);
        request.getEstacionamento().setIdEstacionamento(2L);
    }

    private void entidadesExistentes() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(estacionamentoRepository.findById(2L)).thenReturn(Optional.of(estacionamento));
    }

    @Test
    void listarRetornaEntidades() {
        Registro registro = new Registro(usuario, estacionamento);
        when(repository.findAllByOrderByIdAsc()).thenReturn(List.of(registro));
        assertEquals(List.of(registro), service.listarTodos());
    }

    @Test
    void criarVinculaEntidadesExistentes() {
        entidadesExistentes();
        when(repository.saveAndFlush(any(Registro.class))).thenAnswer(invocation -> {
            Registro registro = invocation.getArgument(0);
            assertSame(usuario, registro.getUsuario()); assertSame(estacionamento, registro.getEstacionamento());
            registro.setId(3L); return registro;
        });
        assertSame(request, service.criar(request));
        verify(usuarioRepository, never()).save(any()); verify(estacionamentoRepository, never()).save(any());
    }

    @Test
    void usuarioInexistenteRetorna404() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
        verifyNoInteractions(repository, estacionamentoRepository);
    }

    @Test
    void duplicataRetorna409SemSalvar() {
        entidadesExistentes();
        when(repository.existsByUsuario_IdUsuarioAndEstacionamento_IdEstacionamento(1L, 2L)).thenReturn(true);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void violacaoDeIntegridadeRetorna409() {
        entidadesExistentes();
        when(repository.saveAndFlush(any(Registro.class))).thenThrow(new DataIntegrityViolationException("duplicate key"));
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class, () -> service.criar(request)).getStatusCode());
    }

    @Test
    void deletarRemoveRegistroExistente() {
        Registro registro = new Registro(usuario, estacionamento);
        when(repository.findById(3L)).thenReturn(Optional.of(registro));
        service.deletar(3L); verify(repository).delete(registro);
    }
}
