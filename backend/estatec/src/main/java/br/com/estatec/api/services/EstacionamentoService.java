package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.repositories.EstacionamentoRepository;

@Service
public class EstacionamentoService {
	
	@Autowired
	private EstacionamentoRepository repository;
	
	public List<Estacionamento> listarTodos(){
		return repository.findAll();
	}
	
	public Optional<Estacionamento> buscarPorId(Long id){
		return repository.findById(id);
	}
	public Estacionamento salvar(Estacionamento estacionamento) {
		return repository.save(estacionamento);
		
	}
	
	public Estacionamento atualizar(Long id, Estacionamento estacionamentoAlterado) {
		Optional<Estacionamento> estacionamentoExistente = buscarPorId(id);
		
		if (estacionamentoExistente.isPresent()) {
			Estacionamento atualizado = estacionamentoExistente.get();
			atualizado.setNomeEstacionamento(estacionamentoAlterado.getNomeEstacionamento());
			atualizado.setQtdVagas(estacionamentoAlterado.getQtdVagas());
			atualizado.setLocalizacao(estacionamentoAlterado.getLocalizacao());
			
			return repository.save(atualizado);
		}
		return null;
	}
	
	public void deletar(Long id) {
		repository.deleteById(id);
	}

}
