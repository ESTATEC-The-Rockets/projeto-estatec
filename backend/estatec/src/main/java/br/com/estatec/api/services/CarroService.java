package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Carro;
import br.com.estatec.api.repositories.CarroRepository;

@Service
public class CarroService {

	// herda funcionalidades da classe "Repository"
	@Autowired
	private CarroRepository repository;

	// Função para listar todos os carros
	public List<Carro> listarTodos() {
		return repository.findAll();
	}

	// Função para buscar o carro pelo id
	public Carro buscarPorId(Long id) {

		return repository.findById(id).orElseThrow(() -> new RuntimeException("Carro não encontrado."));
	}

	// Função para salvar o carro registrados pelo usuario
	public Carro salvar(Carro carro) {
		if (carro.getPlaca() == null || carro.getPlaca().isBlank()) {
			throw new RuntimeException("A placa do carro é obrigatória.");
		}

		Carro carroExistente = repository.findByPlaca(carro.getPlaca());

		// condicional para validar se o carro ja existe ou não
		if (carroExistente != null) {
			throw new RuntimeException("Já existe um carro cadastrado com esta placa.");
		}

		return repository.save(carro);
	}

	// Função para atualizar o carro conforme a edição do usuário
	public Carro atualizar(Long id, Carro carroNovo) {
		Carro carroAntigo = buscarPorId(id);

		if (carroNovo.getMarca() != null && !carroNovo.getMarca().isBlank()) {
			carroAntigo.setMarca(carroNovo.getMarca());
		}

		if (carroNovo.getModelo() != null && !carroNovo.getModelo().isBlank()) {
			carroAntigo.setModelo(carroNovo.getModelo());
		}

		if (carroNovo.getPlaca() != null && !carroNovo.getPlaca().isBlank()) {
			carroAntigo.setPlaca(carroNovo.getPlaca());
		}

		Carro existente = repository.findByPlaca(carroNovo.getPlaca());

		if (existente != null && !existente.getIdCarros().equals(id)) {

			throw new RuntimeException("Já existe um carro com esta placa.");
		}

		carroAntigo.setPlaca(carroNovo.getPlaca());

		if (carroNovo.getCor() != null) {
			carroAntigo.setCor(carroNovo.getCor());
		}

		return repository.save(carroAntigo);

	}

	// Função para deletar carros ja registrados
	public void deletar(Long id) {
		repository.deleteById(id);
		
	}
}
