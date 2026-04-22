package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import br.com.estatec.api.entities.Carros;
import br.com.estatec.api.repositories.CarrosRepository;

public class CarrosService {

	@Service
	public class Service {

	    @Autowired
	    private CarrosRepository repository;

	    public List<Carros> listarTodos() {
	        return repository.findAll();
	    }

	    public Optional<Carros> buscarPorId(Long id) {
	        return repository.findById(id);
	    }

	    public Carros salvar(Carros carros) {
	        return repository.save(carros);
	    }

	    public Carros atualizar(Long id, Carros carroAlterado) {
	        Optional<Carros> carroExistente = buscarPorId(id);

	        if (carroExistente.isPresent()) {  
	            Carros atualizado = carroExistente.get();
	            atualizado.setMarca(carroAlterado.getMarca());
	            atualizado.setModelo(carroAlterado.getModelo());
	            atualizado.setPlaca(carroAlterado.getPlaca());
	            atualizado.setCor(carroAlterado.getCor());

	            if (carroAlterado.getDocumentos() != null) {
	                atualizado.setDocumentos(carroAlterado.getDocumentos());
	            }

	            return repository.save(atualizado);
	        }
	        return null;
	    }

	    public void deletar(Long id) {
	        repository.deleteById(id);
	    }
	}
}
