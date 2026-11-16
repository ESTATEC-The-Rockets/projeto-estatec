package br.com.estatec.api.services;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Optional;
import br.com.estatec.api.entities.ContaAcesso;
import br.com.estatec.api.repositories.ContaAcessoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContaAcessoService {
    private final ContaAcessoRepository repository;
    private final BCryptPasswordEncoder encoder;
    private final String adminEmail;
    private final String dummyHash;
    public ContaAcessoService(ContaAcessoRepository repository, BCryptPasswordEncoder encoder,
            @Value("${estatec.admin.email:}") String adminEmail) {
        this.repository = repository; this.encoder = encoder; this.adminEmail = normalizarEmail(adminEmail);
        this.dummyHash = encoder.encode(java.util.UUID.randomUUID().toString());
    }
    public static String normalizarEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }
    @Transactional
    public ContaAcesso criar(String nome, String email, String senha, String confirmacao) {
        if (!senha.equals(confirmacao)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas n\u00e3o conferem.");
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter no m\u00e1ximo 72 bytes em UTF-8.");
        String normalized = normalizarEmail(email);
        if (normalized.equals(adminEmail) || repository.existsByEmail(normalized))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail j\u00e1 possui uma conta. Entre com sua senha.");
        ContaAcesso conta = new ContaAcesso();
        conta.setNome(nome.trim().replaceAll("\\s+", " "));
        conta.setEmail(normalized); conta.setSenhaHash(encoder.encode(senha));
        return repository.saveAndFlush(conta);
    }
    @Transactional(readOnly = true)
    public Optional<ContaAcesso> autenticar(String email, String senha) {
        var conta = repository.findByEmail(normalizarEmail(email));
        boolean valid = senha.getBytes(StandardCharsets.UTF_8).length <= 72
            && encoder.matches(senha, conta.map(ContaAcesso::getSenhaHash).orElse(dummyHash));
        return valid ? conta : Optional.empty();
    }
    public Optional<ContaAcesso> buscar(Long id) { return repository.findById(id); }
}
