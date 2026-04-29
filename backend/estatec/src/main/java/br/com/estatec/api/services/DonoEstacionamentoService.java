package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.DonoEstacionamento;
import br.com.estatec.api.repositories.DonoEstacionamentoRepository;

@Service
public class DonoEstacionamentoService {

	@Autowired
	private DonoEstacionamentoRepository repository;

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
		
		return repository.save(dono);
	}

	public void deletar(Long id) {
		DonoEstacionamento dono = buscarPorId(id);
		repository.delete(dono);
	}
}
