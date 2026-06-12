package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.DonoCarro;
import br.com.estatec.api.repositories.DonoCarroRepository;

@Service
public class DonoCarroService {
	
	@Autowired
	private DonoCarroRepository repository;

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
		
		return repository.save(donoCarro);
	}

	public void deletar(Long id) {
		DonoCarro donoCarro = buscarPorId(id);
		repository.delete(donoCarro);
	}

}
