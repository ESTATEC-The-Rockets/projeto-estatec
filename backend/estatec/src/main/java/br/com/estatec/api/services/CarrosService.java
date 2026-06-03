package br.com.estatec.api.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.estatec.api.entities.Carros;
import br.com.estatec.api.repositories.CarrosRepository;

@Service
public class CarrosService {

	    @Autowired
	    private CarrosRepository repository;

	    public List<Carros> listarTodos() {
	        return repository.findAll();
	    }

	    public Carros buscarPorId(Long id) {

			return repository.findById(id).orElseThrow(() -> new RuntimeException("Carro não encontrado."));
	    }

	    public Carros salvar(Carros carro) {
	        if (carro.getPlaca() == null || carro.getPlaca().isBlank()) {
	            throw new RuntimeException("A placa do carro é obrigatória.");
	        }

	        Carros carroExistente = repository.findByPlaca(carro.getPlaca());

	        if (carroExistente != null) {
	            throw new RuntimeException("Já existe um carro cadastrado com esta placa.");
	        }

	        return repository.save(carro);
	    }

	    public Carros atualizar(Long id, Carros carroNovo) {
	        Carros carroAntigo = buscarPorId(id);
	        
	        if (carroNovo.getMarca() != null && carroNovo.getMarca().isBlank()) {
				carroAntigo.setMarca(carroNovo.getMarca());
			}
	        
	        if (carroNovo.getModelo() != null && carroNovo.getModelo().isBlank()) {
				carroAntigo.setModelo(carroNovo.getModelo());
			}
	        
	        if (carroNovo.getPlaca() != null && carroNovo.getPlaca().isBlank()) {
				carroAntigo.setPlaca(carroNovo.getPlaca());
			}
	        
	        if (carroNovo.getCor() != null) {
	            carroAntigo.setCor(carroNovo.getCor());
	        }

	        return repository.save(carroAntigo);

	        }

	    public void deletar(Long id) {
	        repository.deleteById(id);
	    }
	}

