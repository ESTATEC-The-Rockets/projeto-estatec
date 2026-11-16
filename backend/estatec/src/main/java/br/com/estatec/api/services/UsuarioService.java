package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.UsuarioRepository;

@Service
public class UsuarioService {

	private static final Pattern BCRYPT_HASH = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

	// Herda as funcionalidades do repository
	@Autowired
	private UsuarioRepository repository;

	@Autowired
	private EstacionamentoRepository estacionamentoRepository;

	@Autowired
	private CarroRepository carroRepository;

	@Autowired
	private RegistroRepository registroRepository;

	// Herda a criptografia do BCrypt
	@Autowired
	private BCryptPasswordEncoder password;

	// Função para listar todos os usuários
	public List<Usuario> listarTodos() {
		return repository.findAll();
	}

	// Função para buscar o usuário pelo id
	public Optional<Usuario> buscarPorId(Long id) {
		return repository.findById(id);
	}

	// Função para buscar o usuário pelo email
	public Optional<Usuario> buscarPorEmail(String email) {
		return repository.findByEmail(email);
	}
	
	// Função para buscar o usuário pelo telefone
	public Optional<Usuario> buscarPorTelefone(String telefone){
		return repository.findByTelefone(telefone);
	}
	
	// Função para buscar o usuário pelo RG
	public Optional<Usuario> buscarPorRg(String rg){
		return repository.findByRg(rg);
	}
	
	// Função para buscar o usuário pelo CPF
	public Optional<Usuario> buscarPorCpf(String cpf){
		return repository.findByCpf(cpf);
	}
	
	// Função para buscar o usuario pelo nome 
	public List<Usuario> buscarPorNome(String nome) {
		return repository.findByNomeContainingIgnoreCase(nome);
	}
	

	// Função para salvar o usuário que esta sendo registrado, validando se as informações ja existem ou não
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

		String senhaCriptografada = password.encode(usuario.getSenha());
		usuario.setSenha(senhaCriptografada);

		return repository.save(usuario);
	}

	// Função que valia o login do usuario
	public Usuario login(String email, String senha) {

	    Usuario usuario = repository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

	    String senhaArmazenada = usuario.getSenha();
	    boolean senhaCriptografada = senhaArmazenada != null && BCRYPT_HASH.matcher(senhaArmazenada).matches();
	    boolean senhaValida = senha != null && (senhaCriptografada
	            ? password.matches(senha, senhaArmazenada)
	            : senhaArmazenada != null && !senhaArmazenada.startsWith("$") && senha.equals(senhaArmazenada));

	    if (!senhaValida) {
	        throw new RuntimeException("Senha inválida.");
	    }

	    if (!senhaCriptografada) {
	        usuario.setSenha(password.encode(senha));
	        repository.save(usuario);
	    }

	    return usuario;
	}

	// Função para salvar alterações feitas nas informações do usuário
	public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
		Optional<Usuario> existente = buscarPorId(id);

		if (existente.isPresent()) {
			Usuario atualizado = existente.get();

			atualizado.setNome(usuarioAtualizado.getNome());
			atualizado.setTelefone(usuarioAtualizado.getTelefone());
			atualizado.setDataNascimento(usuarioAtualizado.getDataNascimento());
			atualizado.setEmail(usuarioAtualizado.getEmail());

			String senhaCriptografada = password.encode(usuarioAtualizado.getSenha());
			atualizado.setSenha(senhaCriptografada);

			return repository.save(atualizado);
		}

		return null;
	}

	// Função para deletar o usuário
	@Transactional
	public void deletar(Long id) {

		if (!repository.existsById(id)) {
			throw new RuntimeException("Usuário não encontrado.");
		}
		// Remove os vínculos dependentes antes do usuário para respeitar as FKs.
		registroRepository.deletarPorUsuario(id);
		estacionamentoRepository.limparDono(id);
		carroRepository.limparDono(id);
		repository.deleteById(id);
	}
}
