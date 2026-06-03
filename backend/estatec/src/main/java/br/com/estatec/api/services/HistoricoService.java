package br.com.estatec.api.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Carros;
import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.entities.Historico;
import br.com.estatec.api.repositories.HistoricoRepository;

@Service
public class HistoricoService {
	 
	@Autowired
	private HistoricoRepository repository;
	
	@Autowired 
	private CarrosService carroService;
	
	@Autowired
	private EstacionamentoService estacionamentoService;
	
	public List<Historico> listarTodos(){
		return repository.findAll();
	}
	
	public Historico buscarPorId(Long id){
		
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Histórico nao encontrado"));
		
	}
	
	public Historico salvar(Historico historico) {
		
		Optional<Carros> carro = carroService.buscarPorId(historico.getCarro().getIdCarros());
	}
	
	public Historico atualizar(Long id, Historico historicoAlterado) {
		Historico historicoExistente = buscarPorId(id);
		
		if(historicoExistente.get()) {
			Historico atualizado = historicoExistente.get();
			atualizado.setCarro(historicoAlterado.getCarro());
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
	
	public Historico saidaEntrada(Carros carro, Estacionamento estacionamento) {
		
		Long totalRegistros = repository.countByCarro_IdCarros(carro.getIdCarros());
		
		Long novaQuantidade = totalRegistros + 1;
		
		Historico novoHistorico = new Historico();
		novoHistorico.setCarro(carro);
		novoHistorico.setEstacionamento(estacionamento);
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
