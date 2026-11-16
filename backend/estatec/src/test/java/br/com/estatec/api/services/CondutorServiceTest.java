package br.com.estatec.api.services;
import org.junit.jupiter.api.Test;
import br.com.estatec.api.entities.Condutor;
import br.com.estatec.api.repositories.CondutorRepository;
import org.springframework.test.util.ReflectionTestUtils;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class CondutorServiceTest {
 @Test void cadastroNaoExigeCredenciais() {
  var repository = mock(CondutorRepository.class);
  var service = new CondutorService(); ReflectionTestUtils.setField(service,"repository",repository);
  var condutor = new Condutor();condutor.setNome("Maria Silva");condutor.setCpf("123.456.789-00");condutor.setEmail("MARIA@example.com");condutor.setTelefone("(11) 99999-0000");
  when(repository.save(condutor)).thenReturn(condutor);
  assertSame(condutor,service.salvar(condutor));assertEquals("12345678900",condutor.getCpf());assertEquals("maria@example.com",condutor.getEmail());
 }
 @Test void atualizarInexistenteRetorna404() {
  var service = new CondutorService();ReflectionTestUtils.setField(service,"repository",mock(CondutorRepository.class));
  var error=assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.atualizar(99L,new Condutor()));
  assertEquals(404,error.getStatusCode().value());
 }
}
