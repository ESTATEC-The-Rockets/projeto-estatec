package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.DonoEstacionamento;
import br.com.estatec.api.repositories.DonoEstacionamentoRepository;

@Service
public class DonoEstacionamentoService {

	@Autowired
	private DonoEstacionamentoRepository repository;
	
	@Autowired
    private BCryptPasswordEncoder passwordEncoder;

	public List<DonoEstacionamento> listarTodos() {
		return repository.findAll();
	}

	public DonoEstacionamento buscarPorId(Long id) {
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Dono de Estacionamento não encontrado"));
	}
	
	public DonoEstacionamento salvar(DonoEstacionamento dono) {
		
        if (repository.findByEmail(dono.getEmail()).isPresent()) {
            throw new RuntimeException("Já existe esse email no Banco de Dados");
        }

		if (repository.findByCpf(dono.getCpf()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este CPF");
		}

		if (repository.findByRg(dono.getRg()).isPresent()) {
			throw new RuntimeException("Já existe um usuário cadastrado com este RG");
		}
		
		String senhaCriptografada = passwordEncoder.encode(dono.getSenha());
        dono.setSenha(senhaCriptografada);
		
		return repository.save(dono);
	}
	
	public DonoEstacionamento atualizar(Long id, DonoEstacionamento donoAtualizado) {
        DonoEstacionamento existente = buscarPorId(id);

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
		DonoEstacionamento dono = buscarPorId(id);
		repository.delete(dono);
	}
}
