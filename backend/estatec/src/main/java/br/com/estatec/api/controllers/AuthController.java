package br.com.estatec.api.controllers;

import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Value("${estatec.registration.code:}")
    private String registrationCode;
    private final BCryptPasswordEncoder encoder;
    private final String email;
    private final String hash;
    private final br.com.estatec.api.services.ContaAcessoService contas;
    public AuthController(BCryptPasswordEncoder encoder,
            @Value("${estatec.admin.email:}") String email,
            @Value("${estatec.admin.password-hash:}") String hash, br.com.estatec.api.services.ContaAcessoService contas) {
        this.encoder = encoder; this.email = email; this.hash = hash; this.contas = contas;
    }
    public record Login(@NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inv\u00e1lido.") String email, @NotBlank(message = "Informe a senha.") @Size(max = 72, message = "A senha deve ter no m\u00e1ximo 72 caracteres.") String senha) {}
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody Login login, HttpServletRequest request) {
        boolean admin = !email.isBlank() && !hash.isBlank() && email.equalsIgnoreCase(login.email().trim())
            && login.senha().getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72
            && encoder.matches(login.senha(), hash);
        var conta = admin ? java.util.Optional.<br.com.estatec.api.entities.ContaAcesso>empty()
            : contas.autenticar(login.email(), login.senha());
        if (!admin && conta.isEmpty()) return ResponseEntity.status(401).body(Avisos.corpo("LOGIN_INVALID"));
        if (request.getSession(false) != null) request.getSession(false).invalidate();
        var session = request.getSession(true);
        session.setAttribute("estatecRole", admin ? "ADMIN" : "OPERATOR");
        session.setAttribute("estatecUserId", admin ? 0L : conta.orElseThrow().getId());
        session.setAttribute("estatecNome", admin ? "Administrador" : conta.orElseThrow().getNome());
        return ResponseEntity.ok(resposta(session));
    }
    public record Cadastro(
        @NotBlank(message = "Informe seu nome.") @Size(max = 120) String nome,
        @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inv\u00e1lido.") @Size(max = 120) String email,
        @NotBlank(message = "Crie uma senha.") @Size(min = 8, max = 72, message = "Use uma senha de 8 a 72 caracteres.") String senha,
        @NotBlank(message = "Confirme a senha.") @Size(max = 72) String confirmacaoSenha, String codigoConvite) {}
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@Valid @RequestBody Cadastro cadastro) {
        if (registrationCode.isBlank() || cadastro.codigoConvite() == null || !java.security.MessageDigest.isEqual(
                registrationCode.getBytes(java.nio.charset.StandardCharsets.UTF_8), cadastro.codigoConvite().getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            return Avisos.resposta(403, "INVITE_INVALID");
        }
        var conta = contas.criar(cadastro.nome(), cadastro.email(), cadastro.senha(), cadastro.confirmacaoSenha());
        return ResponseEntity.status(201).body(Map.of("id", conta.getId(), "nome", conta.getNome(), "email", conta.getEmail()));
    }
    private Map<String, Object> resposta(jakarta.servlet.http.HttpSession session) {
        return Map.of("idUsuario", session.getAttribute("estatecUserId"), "nome", session.getAttribute("estatecNome") == null ? "Administrador" : session.getAttribute("estatecNome"),
            "admin", "ADMIN".equals(session.getAttribute("estatecRole")), "podeGerenciar", true);
    }

    @GetMapping("/sessao")
    public ResponseEntity<?> sessao(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !("ADMIN".equals(session.getAttribute("estatecRole")) || "OPERATOR".equals(session.getAttribute("estatecRole")))) return ResponseEntity.status(401).build();
        if ("OPERATOR".equals(session.getAttribute("estatecRole")) && contas.buscar((Long) session.getAttribute("estatecUserId")).isEmpty()) {
            session.invalidate(); return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(resposta(session));
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        if (request.getSession(false) != null) request.getSession(false).invalidate();
        return ResponseEntity.noContent().build();
    }
}
