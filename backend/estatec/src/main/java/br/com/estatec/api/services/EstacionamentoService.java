package br.com.estatec.api.services;

import java.util.List;

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
	
	public Estacionamento buscarPorId(Long id){
		
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Estacionamento nao encontrado"));
		
	}
	
	
	public Estacionamento salvar(Estacionamento estacionamento) {
		
		Estacionamento estacionamentoExistente = repository.findByNomeEstacionamento(estacionamento.getNomeEstacionamento());
		
		if(estacionamentoExistente != null) {
			
			throw new RuntimeException("Estacionamento ja existe.");
			
		}
		
		return repository.save(estacionamento);
		
	}
	
	public Estacionamento atualizar(Long id, Estacionamento estacionamentoAlterado) {
		Estacionamento estacionamentoExistente = buscarPorId(id);
		
		if (estacionamentoAlterado.getNomeEstacionamento() != null && !estacionamentoAlterado.getNomeEstacionamento().isBlank()){
			
			estacionamentoExistente.setNomeEstacionamento(estacionamentoAlterado.getNomeEstacionamento());
			
		}
		return repository.save(estacionamentoExistente);
	}
	
	public void deletar(Long id) {
		
		Estacionamento estacionamento = buscarPorId(id);
		
		repository.delete(estacionamento);
	}

}
