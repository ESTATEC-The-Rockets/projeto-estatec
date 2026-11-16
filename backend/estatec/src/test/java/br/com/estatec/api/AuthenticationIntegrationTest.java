package br.com.estatec.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
 "spring.datasource.url=jdbc:h2:mem:estatec;MODE=MySQL;DB_CLOSE_DELAY=-1",
 "spring.datasource.driverClassName=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
 "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
 "estatec.admin.email=admin@example.com", "logging.level.root=WARN", "logging.level.org.springframework=WARN", "logging.level.org.hibernate=WARN", "debug=false"
})
@AutoConfigureMockMvc
class AuthenticationIntegrationTest {
 @org.springframework.test.context.DynamicPropertySource
 static void credenciais(org.springframework.test.context.DynamicPropertyRegistry registry) {
  registry.add("estatec.admin.password-hash", () -> new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("SenhaValida123"));
 }
 @Test void loginPeloFiltroCriaSessaoELogoutRevogaAcesso() throws Exception {
  mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"condutor@example.com\",\"senha\":\"SenhaValida123\"}")).andExpect(status().isUnauthorized());
  var result=mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\",\"senha\":\"SenhaValida123\"}"))
    .andExpect(status().isOk()).andReturn();
  var session=(org.springframework.mock.web.MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/condutores").session(session)).andExpect(status().isOk());
  mvc.perform(post("/auth/logout").session(session)).andExpect(status().isNoContent());
  assertTrue(session.isInvalid());
  mvc.perform(get("/condutores")).andExpect(status().isUnauthorized());
  var forged = new org.springframework.mock.web.MockHttpSession();forged.setAttribute("estatecRole","USER");forged.setAttribute("estatecUserId",1L);
  mvc.perform(get("/condutores").session(forged)).andExpect(status().isForbidden());
 }
 @Test void criaContaPersisteSenhaProtegidaEPermiteLoginPosterior() throws Exception {
  String cadastro="{\"nome\":\"Operadora Teste\",\"email\":\"OPERADORA@example.com\",\"senha\":\"MinhaSenha123\",\"confirmacaoSenha\":\"MinhaSenha123\"}";
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("operadora@example.com"))
   .andExpect(jsonPath("$.senha").doesNotExist()).andExpect(jsonPath("$.senhaHash").doesNotExist());
  assertEquals(1,jdbc.queryForObject("select count(*) from tb_conta_acesso where email='operadora@example.com'",Integer.class));
  assertEquals(0,jdbc.queryForObject("select count(*) from tb_usuario where email='operadora@example.com'",Integer.class));
  String hash=jdbc.queryForObject("select senha_hash from tb_conta_acesso where email='operadora@example.com'",String.class);
  assertNotEquals("MinhaSenha123",hash);
  assertTrue(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches("MinhaSenha123",hash));
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro)).andExpect(status().isConflict());
  mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"operadora@example.com\",\"senha\":\"errada\"}")).andExpect(status().isUnauthorized());
  var result=mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"operadora@example.com\",\"senha\":\"MinhaSenha123\"}"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.admin").value(false)).andExpect(jsonPath("$.podeGerenciar").value(true)).andReturn();
  var session=(org.springframework.mock.web.MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/auth/sessao").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Operadora Teste"));
  mvc.perform(get("/condutores").session(session)).andExpect(status().isOk());
  mvc.perform(post("/estacionamento").session(session).contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\"Patio Teste\"}"))
   .andExpect(status().isCreated());
  mvc.perform(post("/auth/logout").session(session)).andExpect(status().isNoContent());assertTrue(session.isInvalid());
  mvc.perform(get("/condutores")).andExpect(status().isUnauthorized());
  var novoLogin=mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"OPERADORA@example.com\",\"senha\":\"MinhaSenha123\"}"))
   .andExpect(status().isOk()).andReturn();
  mvc.perform(get("/auth/sessao").session((org.springframework.mock.web.MockHttpSession)novoLogin.getRequest().getSession(false))).andExpect(status().isOk());
 }
 @Test void cadastroRejeitaConfirmacaoIncorretaESenhaCurta() throws Exception {
  String cadastro="{\"nome\":\"Teste\",\"email\":\"teste@example.com\",\"senha\":\"MinhaSenha123\",\"confirmacaoSenha\":\"OutraSenha123\"}";
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro)).andExpect(status().isBadRequest());
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro.replace("MinhaSenha123","curta"))).andExpect(status().isBadRequest());
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro.replace("teste@example.com","admin@example.com").replace("OutraSenha123","MinhaSenha123"))).andExpect(status().isConflict());
  assertEquals(0,jdbc.queryForObject("select count(*) from tb_conta_acesso where email='teste@example.com'",Integer.class));
 }
 @Autowired MockMvc mvc;
 @Autowired JdbcTemplate jdbc;
 @Test void bloqueiaAcessoSemSessaoESeedPodeSerReexecutado() throws Exception {
  for (String path : new String[]{"/condutores", "/usuarios", "/carros", "/estacionamento", "/historico", "/auth/sessao"})
   mvc.perform(get(path)).andExpect(status().isUnauthorized());
  mvc.perform(post("/condutores/cadastro").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
  assertEquals(1, jdbc.queryForObject("select count(*) from tb_usuario", Integer.class));
  new ResourceDatabasePopulator(new ClassPathResource("data.sql")).execute(jdbc.getDataSource());
  assertEquals(1, jdbc.queryForObject("select count(*) from tb_usuario", Integer.class));
 }
 @Test void permiteInserirEmBancoLegadoSemApagarDadosAntigos() {
  jdbc.execute("alter table tb_usuario add column data_nascimento date default '1990-01-01' not null");
  jdbc.execute("alter table tb_usuario add column senha varchar(255) default 'legado' not null");
  jdbc.execute("alter table tb_usuario add column rg varchar(12) default '1234567' not null");
  try {
   br.com.estatec.api.config.DatabaseInitializationConfig.liberarCamposLegados(jdbc.getDataSource());
   br.com.estatec.api.config.DatabaseInitializationConfig.liberarCamposLegados(jdbc.getDataSource());
   assertEquals("legado", jdbc.queryForObject("select senha from tb_usuario where cpf='12345678900'", String.class));
   jdbc.update("insert into tb_usuario (nome_usuario,cpf,email,telefone,data_nascimento,senha,rg) values ('Novo Condutor','00000000000','novo@example.com','11977776666',null,null,null)");
   jdbc.update("delete from tb_usuario where cpf='00000000000'");
  } finally {
   jdbc.execute("alter table tb_usuario drop column data_nascimento");jdbc.execute("alter table tb_usuario drop column senha");jdbc.execute("alter table tb_usuario drop column rg");
  }
 }
 @Test void cadastraEEditaSemSenha() throws Exception {
  var session = new org.springframework.mock.web.MockHttpSession();session.setAttribute("estatecRole","ADMIN");session.setAttribute("estatecUserId",0L);
  for (String path : new String[]{"/condutores", "/carros", "/estacionamento", "/historico", "/estacionamento/registros"}) mvc.perform(get(path).session(session)).andExpect(status().isOk());
  String payload="{\"nome\":\"Maria Silva\",\"cpf\":\"98765432100\",\"email\":\"maria@example.com\",\"telefone\":\"11988887777\"}";
  mvc.perform(post("/condutores").session(session).contentType(MediaType.APPLICATION_JSON).content(payload))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.senha").doesNotExist());
  Long id=jdbc.queryForObject("select id_usuario from tb_usuario where cpf='98765432100'",Long.class);
  mvc.perform(put("/condutores/"+id).session(session).contentType(MediaType.APPLICATION_JSON).content(payload.replace("Maria Silva","Maria Santos")))
   .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Maria Santos"));
  mvc.perform(post("/condutores").session(session).contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isConflict());
  mvc.perform(delete("/condutores/"+id).session(session)).andExpect(status().isNoContent());
 }
}
