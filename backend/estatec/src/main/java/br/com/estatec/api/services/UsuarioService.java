package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.UsuarioRepository;

@Service
public class UsuarioService {

	@Autowired
	private UsuarioRepository repository;

	@Autowired
	private EstacionamentoRepository estacionamentoRepository;

	@Autowired
	private CarroRepository carroRepository;

	@Autowired
	private RegistroRepository registroRepository;

	// Injeta a interface generica registrada no SecurityConfig
	@Autowired
	private PasswordEncoder passwordEncoder;

	public List<Usuario> listarTodos() {
		return repository.findAll();
	}

	public Optional<Usuario> buscarPorId(Long id) {
		return repository.findById(id);
	}

	public Optional<Usuario> buscarPorEmail(String email) {
		return repository.findByEmail(email);
	}
	
	public Optional<Usuario> buscarPorTelefone(String telefone){
		return repository.findByTelefone(telefone);
	}
	
	public Optional<Usuario> buscarPorRg(String rg){
		return repository.findByRg(rg);
	}
	
	public Optional<Usuario> buscarPorCpf(String cpf){
		return repository.findByCpf(cpf);
	}
	
	public List<Usuario> buscarPorNome(String nome) {
		return repository.findByNomeContainingIgnoreCase(nome);
	}

	public Usuario salvar(Usuario usuario) {

		if (repository.findByCpf(usuario.getCpf()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este CPF.");
		}

		if (repository.findByRg(usuario.getRg()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este RG.");
		}

		if (repository.findByEmail(usuario.getEmail()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este e-mail.");
		}

		if (repository.findByTelefone(usuario.getTelefone()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este telefone.");
		}

		// Encripta a senha apenas se não for um hash BCrypt ($2...)
		if (usuario.getSenha() != null && !usuario.getSenha().startsWith("$2")) {
			usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
		}

		return repository.save(usuario);
	}

	public Usuario login(String email, String senha) {

	    Usuario usuario = repository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

	    // Compara a senha digitada com o hash armazenado
	    boolean senhaValida = passwordEncoder.matches(senha, usuario.getSenha());

	    if (!senhaValida) {
	        throw new RuntimeException("Senha inválida.");
	    }

	    return usuario;
	}

	public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
		Optional<Usuario> existente = buscarPorId(id);

		if (existente.isPresent()) {
			Usuario atualizado = existente.get();

			atualizado.setNome(usuarioAtualizado.getNome());
			atualizado.setTelefone(usuarioAtualizado.getTelefone());
			atualizado.setDataNascimento(usuarioAtualizado.getDataNascimento());
			atualizado.setEmail(usuarioAtualizado.getEmail());

			// Criptografa a nova senha apenas se tiver sido enviada e não for hash
			if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isBlank()) {
				if (!usuarioAtualizado.getSenha().startsWith("$2")) {
					atualizado.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
				} else {
					atualizado.setSenha(usuarioAtualizado.getSenha());
				}
			}

			return repository.save(atualizado);
		}

		return null;
	}

	@Transactional
	public void deletar(Long id) {

		if (!repository.existsById(id)) {
			throw new RuntimeException("Usuário não encontrado.");
		}

		registroRepository.deletarPorUsuario(id);
		estacionamentoRepository.limparDono(id);
		carroRepository.limparDono(id);
		repository.deleteById(id);
	}
}