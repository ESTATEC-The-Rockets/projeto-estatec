package br.com.estatec.api.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.services.UsuarioService;

class UsuarioControllerTest {
    private UsuarioService service;
    private MockMvc mvc;

    @BeforeEach
    void prepararController() {
        service = org.mockito.Mockito.mock(UsuarioService.class);
        UsuarioController controller = new UsuarioController();
        ReflectionTestUtils.setField(controller, "service", service);
        ReflectionTestUtils.setField(controller, "adminEmail", "");
        ReflectionTestUtils.setField(controller, "adminPasswordHash", "");
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void loginRecebeSenhaDoJsonSemExporNaResposta() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@estacionamento.com");
        usuario.setSenha("senha123");
        when(service.login("joao@estacionamento.com", "senha123")).thenReturn(usuario);

        mvc.perform(post("/usuarios/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"joao@estacionamento.com\",\"senha\":\"senha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.admin").value(false))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        verify(service).login("joao@estacionamento.com", "senha123");
    }
}
