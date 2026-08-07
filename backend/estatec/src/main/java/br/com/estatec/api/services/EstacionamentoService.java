package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.repositories.EstacionamentoRepository;

@Service
public class EstacionamentoService {
	
	// Herda funcionalidades da classe "Repository"
	@Autowired
	private EstacionamentoRepository repository;
	
	// Função para listar todos os estacionamento
	public List<Estacionamento> listarTodos(){
		return repository.findAll();
	}
	
	// Função para buscar o estacionamento pelo id
	public Estacionamento buscarPorId(Long id){
		
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Estacionamento nao encontrado"));
		
	}
	
	// Função para salvar o estacionamento registrado pelo usuario
	public Estacionamento salvar(Estacionamento estacionamento) {
		
		Estacionamento estacionamentoExistente = repository.findByNomeEstacionamento(estacionamento.getNomeEstacionamento());
		
		// condicional para validar se o estacionamento ja existe ou não
		if(estacionamentoExistente != null) {
			
			throw new RuntimeException("Estacionamento ja existe.");
			
		}
		
		return repository.save(estacionamento);
		
	}
	
	// Função para atualizar o estacionamento conforme a edição do usuário
	public Estacionamento atualizar(Long id, Estacionamento estacionamentoAlterado) {
		Estacionamento estacionamentoExistente = buscarPorId(id);
		
		if (estacionamentoAlterado.getNomeEstacionamento() != null && !estacionamentoAlterado.getNomeEstacionamento().isBlank()){
			
			estacionamentoExistente.setNomeEstacionamento(estacionamentoAlterado.getNomeEstacionamento());
			
		}
		return repository.save(estacionamentoExistente);
	}
	
	// Função para deletar estacionamento ja registrados
	public void deletar(Long id) {
		
		Estacionamento estacionamento = buscarPorId(id);
		
		repository.delete(estacionamento);
	}

}
