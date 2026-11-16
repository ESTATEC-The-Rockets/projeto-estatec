package br.com.estatec.api.controllers;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class CondutorControllerTest {
 @Test void autenticaSomenteCredenciaisAdministrativas() throws Exception {
  var encoder = new BCryptPasswordEncoder();
  var mvc = MockMvcBuilders.standaloneSetup(new AuthController(encoder, "admin@example.com", encoder.encode("SenhaValida123"), org.mockito.Mockito.mock(br.com.estatec.api.services.ContaAcessoService.class))).build();
  mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\",\"senha\":\"errada\"}")).andExpect(status().isUnauthorized());
  var result = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\",\"senha\":\"SenhaValida123\"}"))
   .andExpect(status().isOk()).andExpect(jsonPath("$.admin").value(true)).andExpect(jsonPath("$.senha").doesNotExist()).andReturn();
  var session = (org.springframework.mock.web.MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/auth/sessao").session(session)).andExpect(status().isOk());
  mvc.perform(post("/auth/logout").session(session)).andExpect(status().isNoContent());
  mvc.perform(get("/auth/sessao")).andExpect(status().isUnauthorized());
  mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"invalido\",\"senha\":\"\"}")).andExpect(status().isBadRequest());
 }
}
