package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.repositories.UsuarioRepository;

@Service
public class UsuarioService {

	@Autowired
	private UsuarioRepository repository;

	@Autowired
	private BCryptPasswordEncoder password;

	public List<Usuario> listarTodos() {
		return repository.findAll();
	}

	public Optional<Usuario> buscarPorId(Long id) {
		return repository.findById(id);
	}


	public Optional<Usuario> buscarPorEmail(String email) {
		return repository.findByEmail(email);
	}

	public Usuario salvar(Usuario usuario) {
		Optional<Usuario> usuarioExistente = buscarPorEmail(usuario.getEmail());

		if (usuarioExistente.isPresent()) {
			throw new RuntimeException("Já existe esse email no Banco de Dados");
		}


    public Usuario salvar(Usuario usuario) {
    	
    	//Email Existente 
    	Optional <Usuario> emailExistente = buscarPorEmail(usuario.getEmail());
		
		if(emailExistente.isPresent()) {
			throw new RuntimeException("Já existe esse email no Banco de Dados");
		}
		
		//Senha Cripitografada
		String senhaCriptografada = password.encode(usuario.getSenha());
		usuario.setSenha(senhaCriptografada);
		
		
		//Telefone Existente
		Optional <Usuario> telefoneExistente = buscarPorTelefone(usuario.getTelefone());
		
		if(telefoneExistente.isPresent()) {
			throw new RuntimeException("Já existe esse Telefone no Banco de Dados");
		}
		
		
		//RG Existente
		Optional <Usuario> rgExistente = buscarPorRg(usuario.getRg());
		
		if(rgExistente.isPresent()) {
			throw new RuntimeException("Já existe esse rg no Banco de Dados");
		}
    	
        return repository.save(usuario);
    }
    
    public Optional<Usuario> buscarPorEmail(String email){
		
		return repository.findByEmail(email);
	}
    
    public Optional<Usuario> buscarPorTelefone(String telefone){
		
		return repository.findByTelefone(telefone);
	}
    
    public Optional<Usuario> buscarPorRg(String rg){
		
		return repository.findByRg(rg);
	}

		return repository.save(usuario);
	}

	public Usuario login(String email, String senha) {
		Optional<Usuario> usuarioExistente = buscarPorEmail(email);

		if (usuarioExistente.isPresent()) {
			Usuario usuario = usuarioExistente.get();

			if (password.matches(senha, usuario.getSenha())) {
				return usuario;
			}
		}

		throw new RuntimeException("E-mail ou senha inválidos.");
	}

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

	public void deletar(Long id) {
		repository.deleteById(id);
	}
}