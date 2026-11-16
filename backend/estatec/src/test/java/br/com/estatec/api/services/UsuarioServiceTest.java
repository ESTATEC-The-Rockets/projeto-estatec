package br.com.estatec.api.services;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    private static final String BCRYPT_HASH = "$2a$10$" + "A".repeat(53);

    @Mock private UsuarioRepository repository;
    @Mock private EstacionamentoRepository estacionamentoRepository;
    @Mock private CarroRepository carroRepository;
    @Mock private RegistroRepository registroRepository;
    @Mock private BCryptPasswordEncoder password;
    @InjectMocks private UsuarioService service;

    private Usuario usuario;

    @BeforeEach
    void prepararUsuario() {
        usuario = new Usuario();
        usuario.setEmail("joao@estacionamento.com");
        usuario.setSenha("senha123");
    }

    @Test
    void loginValidaSenhaBcrypt() {
        usuario.setSenha(BCRYPT_HASH);
        when(repository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(password.matches("senha123", BCRYPT_HASH)).thenReturn(true);

        assertSame(usuario, service.login(usuario.getEmail(), "senha123"));
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void loginMigraSenhaLegadaParaBcrypt() {
        when(repository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(password.encode("senha123")).thenReturn(BCRYPT_HASH);
        when(repository.save(usuario)).thenReturn(usuario);

        assertSame(usuario, service.login(usuario.getEmail(), "senha123"));
        verify(repository).save(usuario);
    }

    @Test
    void loginRejeitaSenhaIncorreta() {
        when(repository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));

        assertThrows(RuntimeException.class, () -> service.login(usuario.getEmail(), "incorreta"));
        verify(repository, never()).save(any(Usuario.class));
    }
}
