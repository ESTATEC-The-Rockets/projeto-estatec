package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.repositories.HistoricoRepository;

@Service
public class HistoricoService {
	 
	@Autowired
	private HistoricoRepository repository;
	
	public List<Historico> listarTodos(){
		return repository.findAll();
	}
	
	public Optional<Historico> buscarPorId(Long id){
		return repository.findById(id);		
	}
	
	public Historico salvar(Historico historico) {
		return repository.save(historico);
		
	}
	
	public Historico atualizar(Long id, Historico historicoAlterado) {
		Optional<Historico> historicoExistente = buscarPorId(id);
		
		if(historicoExistente.isPresent()) {
			Historico atualizado = historicoExistente.get();
			atualizado.setDonoCarro(historicoAlterado.getDonoCarro());
			atualizado.setDate(historicoAlterado.getDate());
			atualizado.setEstacionamento(historicoAlterado.getEstacionamento());
			atualizado.setHorarioEntrada(historicoAlterado.getHorarioEntrada());
			atualizado.setHorarioSaida(historicoAlterado.getHorarioSaida());
			
			return repository.save(atualizado);
		}
		return null;
		
		
	}
	
	public void deletar(Long id) {
		repository.deleteById(id);
	}
	
}
