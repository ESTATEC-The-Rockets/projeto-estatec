package br.com.estatec.api.controllers;

import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.services.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios") // endpoint
public class UsuarioController {
	
	// herda todas as funções da classe "Service"
	@Autowired
	private UsuarioService service;

	@Autowired
	private BCryptPasswordEncoder encoder;

	@Value("${estatec.admin.email:}")
	private String adminEmail;

	@Value("${estatec.admin.password-hash:}")
	private String adminPasswordHash;

	// Método para cadastrar o usuario no sistema
	@PostMapping("/cadastro")
	public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody Usuario usuario) {

		Usuario usuarioSalvo = service.salvar(usuario);

		return ResponseEntity.status(HttpStatus.CREATED).body(usuarioSalvo);
	}

	// metodo para validar o login do usuário no sistema
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Usuario usuarioLogin, HttpServletRequest request){
	    try {
	        if (!adminEmail.isBlank() && !adminPasswordHash.isBlank()
	                && adminEmail.equalsIgnoreCase(usuarioLogin.getEmail())
	                && encoder.matches(usuarioLogin.getSenha(), adminPasswordHash)) {
	            if (request.getSession(false) != null) request.getSession(false).invalidate();
	            request.getSession(true).setAttribute("estatecRole", "ADMIN");
	            request.getSession().setAttribute("estatecUserId", 0L);
	            return ResponseEntity.ok(Map.of("idUsuario", 0, "nome", "Administrador", "admin", true));
	        }
	        Usuario usuario = service.login(usuarioLogin.getEmail(), usuarioLogin.getSenha());
	        
	        // Se encontrou o utilizador e a senha bateu certo
	        if (usuario != null) {
	            if (request.getSession(false) != null) request.getSession(false).invalidate();
	            request.getSession(true).setAttribute("estatecRole", "USER");
	            request.getSession().setAttribute("estatecUserId", usuario.getId());
	            return ResponseEntity.ok(Map.of("idUsuario", usuario.getId(), "nome", usuario.getNome(), "admin", false));
	        }
	        
	        // Se as credenciais estiverem erradas, devolve o erro 401 Unauthorized
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	        
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
	    if (request.getSession(false) != null) request.getSession(false).invalidate();
	    return ResponseEntity.noContent().build();
	}
	
	// Método para listar todos usuários registrados
	@GetMapping
	public ResponseEntity<List<Usuario>> listarTodos(HttpSession session){
	    if ("ADMIN".equals(session.getAttribute("estatecRole"))) {
	        return ResponseEntity.ok(service.listarTodos());
	    }
	    Object id = session.getAttribute("estatecUserId");
	    if (!(id instanceof Long usuarioId)) {
	        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
	    }
	    return ResponseEntity.ok(service.buscarPorId(usuarioId).map(List::of).orElseGet(List::of));
	}
	
	// Método para buscar os usuários pelo id
	@GetMapping("/{id}")
	public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id, HttpSession session){
	    exigirProprioUsuarioOuAdmin(id, session);

	    return service.buscarPorId(id)
	            .map(ResponseEntity::ok)
	            .orElse(ResponseEntity.notFound().build());
	}
	
	// Método para editar/atualizar o usuário ja registrado já
	@PutMapping("/{id}")
	public ResponseEntity<Usuario> atualizar(
	        @PathVariable Long id,
	        @Valid @RequestBody Usuario usuario, HttpSession session){
	    exigirProprioUsuarioOuAdmin(id, session);

	    Usuario atualizado = service.atualizar(id, usuario);

	    return ResponseEntity.ok(atualizado);
	}
	
	// Método para deletar usuário registrados do sistema
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id){

	    service.deletar(id);

	    return ResponseEntity.noContent().build();
	}

	private void exigirProprioUsuarioOuAdmin(Long id, HttpSession session) {
	    if ("ADMIN".equals(session.getAttribute("estatecRole"))) return;
	    if (!id.equals(session.getAttribute("estatecUserId"))) {
	        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
	    }
	}
	
	
}
