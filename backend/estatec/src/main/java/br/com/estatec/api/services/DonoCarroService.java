package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.DonoCarro;
import br.com.estatec.api.repositories.DonoCarroRepository;

@Service
public class DonoCarroService {
	
	@Autowired
	private DonoCarroRepository repository;
	
	@Autowired
    private BCryptPasswordEncoder passwordEncoder;

	public List<DonoCarro> listarTodos() {
		return repository.findAll();
	}

	public DonoCarro buscarPorId(Long id) {
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Dono de carro não encontrado"));
	}
	
	public DonoCarro salvar(DonoCarro donoCarro) {
		
        if (repository.findByEmail(donoCarro.getEmail()).isPresent()) {
            throw new RuntimeException("Já existe esse email no Banco de Dados");
        }

		if (repository.findByCpf(donoCarro.getCpf()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este CPF");
		}

		if (repository.findByRg(donoCarro.getRg()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este RG");
		}
		
		String senhaCriptografada = passwordEncoder.encode(donoCarro.getSenha());
        donoCarro.setSenha(senhaCriptografada);
		
		return repository.save(donoCarro);
	}
	
	public DonoCarro atualizar(Long id, DonoCarro donoAtualizado) {
        DonoCarro existente = buscarPorId(id);

        existente.setNome(donoAtualizado.getNome());
        existente.setTelefone(donoAtualizado.getTelefone());
        existente.setDataNascimento(donoAtualizado.getDataNascimento());
        existente.setEmail(donoAtualizado.getEmail());

        if(donoAtualizado.getSenha() != null && !donoAtualizado.getSenha().isEmpty()) {
            String senhaCriptografada = passwordEncoder.encode(donoAtualizado.getSenha());
            existente.setSenha(senhaCriptografada);
        }

        return repository.save(existente);
    }

	public void deletar(Long id) {
		DonoCarro donoCarro = buscarPorId(id);
		repository.delete(donoCarro);
	}

}
