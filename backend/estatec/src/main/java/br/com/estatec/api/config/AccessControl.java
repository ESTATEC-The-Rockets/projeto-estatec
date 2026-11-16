package br.com.estatec.api.config;

import br.com.estatec.api.entities.Condutor;
import br.com.estatec.api.repositories.CondutorRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AccessControl {
    private final CondutorRepository usuarios;

    public AccessControl(CondutorRepository usuarios) {
        this.usuarios = usuarios;
    }

    public boolean isAdmin(HttpSession session) {
        return "ADMIN".equals(session.getAttribute("estatecRole")) || "OPERATOR".equals(session.getAttribute("estatecRole"));
    }

    public Long userId(HttpSession session) {
        Object value = session.getAttribute("estatecUserId");
        if (!(value instanceof Long id)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return id;
    }

    public Condutor currentUser(HttpSession session) {
        return usuarios.findById(userId(session))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    public void requireOwnerOrAdmin(Condutor owner, HttpSession session) {
        if (isAdmin(session)) return;
        if (owner == null || !userId(session).equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para esta ação.");
        }
    }
}
