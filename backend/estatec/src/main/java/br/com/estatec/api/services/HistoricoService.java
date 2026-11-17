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
	@Autowired private br.com.estatec.api.repositories.EstacionamentoRepository estacionamentos;
	@Autowired private br.com.estatec.api.repositories.CarroRepository carros;

	public List<Historico> listarTodos() {
		return repository.findAll();
	}

	public Historico buscarPorId(Long id) {
		return repository.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Histórico não encontrado."));
	}

	public Historico criar(Historico historico) {
		historico.setId(null);
		validarReferencias(historico);
		return repository.save(historico);
	}

	public Historico atualizar(Long id, Historico alterado) {
		Historico atual = buscarPorId(id);
		validarReferencias(alterado);
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

    private void validarReferencias(Historico historico) {
        if (historico.getEstacionamento() == null || historico.getEstacionamento().getIdEstacionamento() == null)
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Selecione um estacionamento.");
        historico.setEstacionamento(estacionamentos.findById(historico.getEstacionamento().getIdEstacionamento())
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Estacionamento não encontrado.")));
        if (historico.getCarro() != null) {
            if (historico.getCarro().getIdCarros() == null)
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Selecione um carro.");
            historico.setCarro(carros.findById(historico.getCarro().getIdCarros())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Carro não encontrado.")));
        }
    }

}
