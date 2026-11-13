package br.com.estatec.api.config;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AccessControl {
    private final UsuarioRepository usuarios;

    public AccessControl(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    public boolean isAdmin(HttpSession session) {
        return "ADMIN".equals(session.getAttribute("estatecRole"));
    }

    public Long userId(HttpSession session) {
        Object value = session.getAttribute("estatecUserId");
        if (!(value instanceof Long id)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return id;
    }

    public Usuario currentUser(HttpSession session) {
        return usuarios.findById(userId(session))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    public void requireOwnerOrAdmin(Usuario owner, HttpSession session) {
        if (isAdmin(session)) return;
        if (owner == null || !userId(session).equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }
    }
}
