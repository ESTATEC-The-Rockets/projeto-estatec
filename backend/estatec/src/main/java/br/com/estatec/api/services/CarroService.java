package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import br.com.estatec.api.entities.Carro;
import br.com.estatec.api.repositories.CarroRepository;

@Service
public class CarroService {

	@Autowired
	private CarroRepository repository;

	@Autowired private br.com.estatec.api.repositories.CondutorRepository condutores;
    @Autowired private br.com.estatec.api.repositories.RegistroRepository registros;
    @Autowired private br.com.estatec.api.repositories.HistoricoRepository historicos;

	public List<Carro> listarTodos() {
		return repository.findAll();
	}

	public Carro buscarPorId(Long id) {
		return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carro não encontrado."));
	}

	public Carro salvar(Long condutorId, Carro carro) {
		if (carro.getPlaca() == null || carro.getPlaca().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a placa do carro.");
		}

		Optional<Carro> carroExistente = repository.findByPlaca(carro.getPlaca());

		if (carroExistente.isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta placa já está cadastrada.");
		}

        carro.setIdCarros(null);
        carro.setUsuario(condutores.findById(condutorId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condutor não encontrado.")));
		return repository.save(carro);
	}

	public Carro atualizar(Long id, Carro carroNovo) {
		Carro carroAntigo = buscarPorId(id);
        if (carroAntigo.getUsuario() == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Selecione um condutor para este carro.");
        if (carroNovo.getUsuario() != null && !carroAntigo.getUsuario().getId().equals(carroNovo.getUsuario().getId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O condutor deste carro não pode ser alterado.");

		if (carroNovo.getMarca() != null && !carroNovo.getMarca().isBlank()) {
			carroAntigo.setMarca(carroNovo.getMarca());
		}

		if (carroNovo.getModelo() != null && !carroNovo.getModelo().isBlank()) {
			carroAntigo.setModelo(carroNovo.getModelo());
		}

		if (carroNovo.getPlaca() != null && !carroNovo.getPlaca().isBlank()) {
			Carro existente = repository.findByPlaca(carroNovo.getPlaca()).orElse(null);

			if (existente != null && !existente.getIdCarros().equals(id)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta placa já está cadastrada.");
			}
			carroAntigo.setPlaca(carroNovo.getPlaca());
		}

		if (carroNovo.getCor() != null) {
			carroAntigo.setCor(carroNovo.getCor());
		}

		return repository.save(carroAntigo);
	}

	@org.springframework.transaction.annotation.Transactional
    public void deletar(Long id) {
        buscarPorId(id);
        registros.deletarPorCarro(id);
        historicos.limparCarro(id);
		repository.deleteById(id);
	}
}
