package br.com.estatec.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.estatec.api.entities.Condutor;
import br.com.estatec.api.repositories.CarroRepository;
import br.com.estatec.api.repositories.EstacionamentoRepository;
import br.com.estatec.api.repositories.RegistroRepository;
import br.com.estatec.api.repositories.CondutorRepository;

@Service
public class CondutorService {

	@Autowired
	private CondutorRepository repository;

	@Autowired
	private EstacionamentoRepository estacionamentoRepository;

	@Autowired
	private CarroRepository carroRepository;

	@Autowired
	private RegistroRepository registroRepository;

	public List<Condutor> listarTodos() {
		return repository.findAll();
	}

	public Optional<Condutor> buscarPorId(Long id) {
		return repository.findById(id);
	}

	public Optional<Condutor> buscarPorEmail(String email) {
		return repository.findByEmail(email);
	}

	public Optional<Condutor> buscarPorTelefone(String telefone){
		return repository.findByTelefone(telefone);
	}

	public Optional<Condutor> buscarPorCpf(String cpf){
		return repository.findByCpf(cpf);
	}

	public List<Condutor> buscarPorNome(String nome) {
		return repository.findByNomeContainingIgnoreCase(nome);
	}

	public Condutor salvar(Condutor usuario) {

        if (repository.existsByCpfOrEmailOrTelefone(usuario.getCpf(), usuario.getEmail(), usuario.getTelefone())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "CPF, e-mail ou telefone já cadastrado.");
        }

		return repository.save(usuario);
	}

	public Condutor atualizar(Long id, Condutor usuarioAtualizado) {
		Optional<Condutor> existente = buscarPorId(id);

		if (existente.isPresent()) {
			Condutor atualizado = existente.get();

			atualizado.setNome(usuarioAtualizado.getNome());
			atualizado.setTelefone(usuarioAtualizado.getTelefone());

			atualizado.setEmail(usuarioAtualizado.getEmail());

			atualizado.setCpf(usuarioAtualizado.getCpf());

			return repository.save(atualizado);
		}

		throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Condutor não encontrado.");
	}

	@Transactional
	public void deletar(Long id) {

		if (!repository.existsById(id)) {
			throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Condutor não encontrado.");
		}
        if (carroRepository.existsByUsuario_IdUsuario(id)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Exclua os carros antes de remover o condutor.");
        }
        registroRepository.deletarPorUsuario(id);
		estacionamentoRepository.limparDono(id);

		repository.deleteById(id);
	}
}
