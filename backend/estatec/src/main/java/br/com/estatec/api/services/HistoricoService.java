package br.com.estatec.api.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.DonoCarro;
import br.com.estatec.api.entities.Estacionamento;
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
			atualizado.setData(historicoAlterado.getData());
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
	
	public Historico saidaEntrada(DonoCarro dono, Estacionamento estaci) {
		
		Long totalRegistros = repository.countByDonoCarroId(dono.getId());
		
		Long novaQuantidade = totalRegistros + 1;
		
		Historico novoHistorico = new Historico();
		novoHistorico.setDonoCarro(dono);
		novoHistorico.setEstacionamento(estaci);
		novoHistorico.setData(LocalDate.now());
		
		if(novaQuantidade % 2 != 0) {
			novoHistorico.setEntrada(true);
			novoHistorico.setHorarioEntrada(LocalTime.now());
	} else { 
		novoHistorico.setEntrada(false);
		novoHistorico.setHorarioSaida(LocalTime.now());
	}
		return repository.save(novoHistorico);
	
	}
}
