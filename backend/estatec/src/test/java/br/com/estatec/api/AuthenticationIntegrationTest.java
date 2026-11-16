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
 "estatec.registration.code=convite-teste", "estatec.access.api-key=iot-teste", "estatec.admin.email=admin@example.com", "logging.level.root=WARN", "logging.level.org.springframework=WARN", "logging.level.org.hibernate=WARN", "debug=false"
})
@AutoConfigureMockMvc
class AuthenticationIntegrationTest {
 @Test @org.springframework.transaction.annotation.Transactional
 void raspberryRegistraEntradaSaidaENegacaoComChaveSemSessao() throws Exception {
  var session = new org.springframework.mock.web.MockHttpSession();session.setAttribute("estatecRole","ADMIN");session.setAttribute("estatecUserId",0L);
  String driver="{\"nome\":\"Ana D'Avila\",\"cpf\":\"11144477735\",\"email\":\"iot@example.com\",\"telefone\":\"11988886666\"}";
  mvc.perform(post("/condutores/cadastro").session(session).contentType(MediaType.APPLICATION_JSON).content(driver)).andExpect(status().isCreated());
  Long owner=jdbc.queryForObject("select id_usuario from tb_usuario where email='iot@example.com'",Long.class);
  mvc.perform(post("/condutores/cadastro").session(session).contentType(MediaType.APPLICATION_JSON).content(driver.replace("11144477735","11111111111")))
    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CPF_INVALID"));
  String car="{\"marca\":\"GM\",\"modelo\":\"Onix\",\"placa\":\"iot-1234\",\"cor\":\"PRETO\"}";
  mvc.perform(post("/condutores/"+owner+"/carros").session(session).contentType(MediaType.APPLICATION_JSON).content(car))
    .andExpect(status().isCreated()).andExpect(jsonPath("$.placa").value("IOT1234"));
  mvc.perform(post("/condutores/"+owner+"/carros").session(session).contentType(MediaType.APPLICATION_JSON).content(car.replace("iot-1234","IOT1234")))
    .andExpect(status().isConflict());
  Long vehicle=jdbc.queryForObject("select id_carros from tb_carros where placa='IOT1234'",Long.class);
  mvc.perform(post("/estacionamento").session(session).contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\"IoT #24h\"}")).andExpect(status().isCreated());
  Long parking=jdbc.queryForObject("select id_estacionamento from tb_estacionamento where nome_estacionamento='IoT #24h'",Long.class);
  jdbc.update("insert into tb_registro(fk_usuario,fk_carro,fk_estacionamento) values (?,?,?)",owner,vehicle,parking);
  String access="{\"placa\":\"iot-1234\",\"estacionamentoId\":\""+parking+"\",\"movimento\":\"ENTRADA\"}";
  mvc.perform(post("/api/acesso/validar").contentType(MediaType.APPLICATION_JSON).content(access)).andExpect(status().isUnauthorized());
  for(String direction : new String[]{"ENTRADA","SAIDA"}) {
   mvc.perform(post("/api/acesso/validar").header("X-API-Key","iot-teste").contentType(MediaType.APPLICATION_JSON).content(access.replace("ENTRADA",direction)))
    .andExpect(status().isOk()).andExpect(jsonPath("$.autorizado").value(true)).andExpect(jsonPath("$.movimento").value(direction));
  }
  assertEquals(1,jdbc.queryForObject("select count(*) from tb_historico where placa_lida='IOT1234' and is_entrada=true",Integer.class));
  assertEquals(1,jdbc.queryForObject("select count(*) from tb_historico where placa_lida='IOT1234' and is_entrada=false",Integer.class));
  mvc.perform(post("/api/acesso/validar").header("X-API-Key","iot-teste").contentType(MediaType.APPLICATION_JSON).content(access.replace("iot-1234","ZZZ9999")))
    .andExpect(status().isOk()).andExpect(jsonPath("$.autorizado").value(false));
  mvc.perform(post("/api/acesso/validar").header("X-API-Key","iot-teste").contentType(MediaType.APPLICATION_JSON).content(access.replace("ENTRADA","INVALIDO")))
    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("MOVEMENT_REQUIRED"));
  mvc.perform(get("/historico/9223372036854775000").session(session)).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("HISTORY_NOT_FOUND"));
 }
 @Test void cadastroSemConviteNaoCriaOperador() throws Exception {
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Teste\",\"email\":\"semconvite@example.com\",\"senha\":\"MinhaSenha123\",\"confirmacaoSenha\":\"MinhaSenha123\"}"))
    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("INVITE_INVALID"));
  assertEquals(0,jdbc.queryForObject("select count(*) from tb_conta_acesso where email='semconvite@example.com'",Integer.class));
 }
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
  String cadastro="{\"nome\":\"Operadora Teste\",\"email\":\"OPERADORA@example.com\",\"senha\":\"MinhaSenha123\",\"codigoConvite\":\"convite-teste\",\"confirmacaoSenha\":\"MinhaSenha123\"}";
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
  String cadastro="{\"nome\":\"Teste\",\"email\":\"teste@example.com\",\"senha\":\"MinhaSenha123\",\"codigoConvite\":\"convite-teste\",\"confirmacaoSenha\":\"OutraSenha123\"}";
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro)).andExpect(status().isBadRequest());
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro.replace("MinhaSenha123","curta"))).andExpect(status().isBadRequest());
  mvc.perform(post("/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro.replace("teste@example.com","admin@example.com").replace("OutraSenha123","MinhaSenha123"))).andExpect(status().isConflict());
  assertEquals(0,jdbc.queryForObject("select count(*) from tb_conta_acesso where email='teste@example.com'",Integer.class));
 }
 @Test
 @org.springframework.transaction.annotation.Transactional
 void carrosSaoCriadosSomenteNoContextoDoCondutorEAtualizacaoPreservaDono() throws Exception {
  var session = new org.springframework.mock.web.MockHttpSession();session.setAttribute("estatecRole","ADMIN");session.setAttribute("estatecUserId",0L);
  Long dono=jdbc.queryForObject("select id_usuario from tb_usuario where cpf='12345678909'",Long.class);
  String car="{\"marca\":\"Honda\",\"modelo\":\"Civic\",\"placa\":\"ABC1D23\",\"cor\":\"PRETO\",\"usuario\":{\"id\":999999}}";
  mvc.perform(post("/carros").session(session).contentType(MediaType.APPLICATION_JSON).content(car)).andExpect(status().isMethodNotAllowed());
  mvc.perform(post("/condutores/999999/carros").session(session).contentType(MediaType.APPLICATION_JSON).content(car)).andExpect(status().isNotFound());
  mvc.perform(post("/condutores/"+dono+"/carros").session(session).contentType(MediaType.APPLICATION_JSON).content(car))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.usuario.id").value(dono.intValue()));
  Long id=jdbc.queryForObject("select id_carros from tb_carros where placa='ABC1D23'",Long.class);
  mvc.perform(put("/carros/"+id).session(session).contentType(MediaType.APPLICATION_JSON).content(car.replace(",\"usuario\":{\"id\":999999}","").replace("Civic","Accord")))
   .andExpect(status().isOk()).andExpect(jsonPath("$.usuario.id").value(dono.intValue())).andExpect(jsonPath("$.modelo").value("Accord"));
  mvc.perform(put("/carros/"+id).session(session).contentType(MediaType.APPLICATION_JSON).content(car)).andExpect(status().isBadRequest());
  mvc.perform(delete("/condutores/"+dono).session(session)).andExpect(status().isConflict());
  assertEquals(dono,jdbc.queryForObject("select fk_dono_carro from tb_carros where id_carros=?",Long.class,id));
 }
 @Test
 @org.springframework.transaction.annotation.Transactional
 void excluiCarroRemoveVinculosEPreservaHistorico() throws Exception {
  var session = new org.springframework.mock.web.MockHttpSession();session.setAttribute("estatecRole","ADMIN");session.setAttribute("estatecUserId",0L);
  Long dono=jdbc.queryForObject("select id_usuario from tb_usuario where cpf='12345678909'",Long.class);
  mvc.perform(post("/condutores/"+dono+"/carros").session(session).contentType(MediaType.APPLICATION_JSON).content("{\"marca\":\"Honda\",\"modelo\":\"Civic\",\"placa\":\"DEF2G34\",\"cor\":\"PRETO\"}")).andExpect(status().isCreated());
  Long car=jdbc.queryForObject("select id_carros from tb_carros where placa='DEF2G34'",Long.class);
  jdbc.update("insert into tb_estacionamento(nome_estacionamento) values ('Patio Carros Teste')");
  Long parking=jdbc.queryForObject("select id_estacionamento from tb_estacionamento where nome_estacionamento='Patio Carros Teste'",Long.class);
  jdbc.update("insert into tb_registro(fk_usuario,fk_carro,fk_estacionamento) values (?,?,?)",dono,car,parking);
  jdbc.update("insert into tb_historico(fk_carro,fk_estacionamento,placa_lida,data_hora,is_entrada,autorizado) values (?,?,?,CURRENT_TIMESTAMP,true,true)",car,parking,"DEF2G34");
  mvc.perform(delete("/carros/"+car).session(session)).andExpect(status().isOk());
  assertEquals(0,jdbc.queryForObject("select count(*) from tb_registro where fk_carro=?",Integer.class,car));
  assertEquals(1,jdbc.queryForObject("select count(*) from tb_historico where placa_lida='DEF2G34' and fk_carro is null",Integer.class));
 }
 @Test
 @org.springframework.transaction.annotation.Transactional
 void nomeDoEstacionamentoAceitaNumerosSimbolosEAcentosNoCadastroENaEdicao() throws Exception {
  var session = new org.springframework.mock.web.MockHttpSession();session.setAttribute("estatecRole","ADMIN");session.setAttribute("estatecUserId",0L);
  String nome="P\u00e1tio #2 - 24h & Cia.";
  mvc.perform(post("/estacionamento").session(session).contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\""+nome+"\"}"))
    .andExpect(status().isCreated()).andExpect(jsonPath("$.nomeEstacionamento").value(nome));
  Long id=jdbc.queryForObject("select id_estacionamento from tb_estacionamento where nome_estacionamento=?",Long.class,nome);
  mvc.perform(put("/estacionamento/"+id).session(session).contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\"Garagem / Bloco_A (VIP) 2026\"}"))
    .andExpect(status().isOk()).andExpect(jsonPath("$.nomeEstacionamento").value("Garagem / Bloco_A (VIP) 2026"));
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
   assertEquals("legado", jdbc.queryForObject("select senha from tb_usuario where cpf='12345678909'", String.class));
   jdbc.update("insert into tb_usuario (nome_usuario,cpf,email,telefone,data_nascimento,senha,rg) values ('Novo Condutor','00000000000','novo@example.com','11977776666',null,null,null)");
   jdbc.update("delete from tb_usuario where cpf='00000000000'");
  } finally {
   jdbc.execute("alter table tb_usuario drop column data_nascimento");jdbc.execute("alter table tb_usuario drop column senha");jdbc.execute("alter table tb_usuario drop column rg");
  }
 }
 @Test void cadastraEEditaSemSenha() throws Exception {
  var session = new org.springframework.mock.web.MockHttpSession();session.setAttribute("estatecRole","ADMIN");session.setAttribute("estatecUserId",0L);
  for (String path : new String[]{"/condutores", "/carros", "/estacionamento", "/historico", "/estacionamento/registros"}) mvc.perform(get(path).session(session)).andExpect(status().isOk());
  String payload="{\"nome\":\"Maria Silva\",\"cpf\":\"52998224725\",\"email\":\"maria@example.com\",\"telefone\":\"11988887777\"}";
  mvc.perform(post("/condutores").session(session).contentType(MediaType.APPLICATION_JSON).content(payload))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.senha").doesNotExist());
  Long id=jdbc.queryForObject("select id_usuario from tb_usuario where cpf='52998224725'",Long.class);
  mvc.perform(put("/condutores/"+id).session(session).contentType(MediaType.APPLICATION_JSON).content(payload.replace("Maria Silva","Maria Santos")))
   .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Maria Santos"));
  mvc.perform(post("/condutores").session(session).contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isConflict());
  mvc.perform(delete("/condutores/"+id).session(session)).andExpect(status().isNoContent());
 }
}
