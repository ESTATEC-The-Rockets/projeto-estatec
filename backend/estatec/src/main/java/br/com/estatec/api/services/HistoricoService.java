package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.repositories.HistoricoRepository;

@Service
public class HistoricoService {

	@Autowired
	private HistoricoRepository repository;

	public List<Historico> listarTodos() {
		return repository.findAll();
	}

	public Historico buscarPorId(Long id) {

		return repository.findById(id).orElseThrow(() -> new RuntimeException("Histórico nao encontrado"));

	}
	
	public Historico criar(Historico historico) {
		
		return repository.save(historico);
	}

}
