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
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Histórico não encontrado"));
	}

	public Historico criar(Historico historico) {
		return repository.save(historico);
	}

	public Historico atualizar(Long id, Historico alterado) {
		Historico atual = buscarPorId(id);
		atual.setPlacaLida(alterado.getPlacaLida());
		atual.setCarro(alterado.getCarro());
		atual.setEstacionamento(alterado.getEstacionamento());
		atual.setDataHora(alterado.getDataHora());
		atual.setEntrada(alterado.isEntrada());
		atual.setAutorizado(alterado.isAutorizado());
		return repository.save(atual);
	}

	public void deletar(Long id) {
		repository.deleteById(buscarPorId(id).getId());
	}

}