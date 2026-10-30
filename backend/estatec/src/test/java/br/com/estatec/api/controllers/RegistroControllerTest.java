package br.com.estatec.api.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import br.com.estatec.api.dto.RegistroDTO;
import br.com.estatec.api.dto.RegistroRequest;
import br.com.estatec.api.services.RegistroService;

class RegistroControllerTest {

    private static final String URL = "/estacionamento/registros";
    private RegistroService service;
    private MockMvc mvc;

    @BeforeEach
    void prepararController() {
        service = mock(RegistroService.class);
        mvc = MockMvcBuilders.standaloneSetup(new RegistroController(service)).build();
    }

    @Test
    void listarRetornaContratoSemDadosDoUsuario() throws Exception {
        when(service.listarTodos()).thenReturn(List.of(new RegistroDTO(3L, 1L, 2L)));
        mvc.perform(get(URL))
                .andExpect(status().isOk())
                .andExpect(content().json("[{\"id\":3,\"usuarioId\":1,\"estacionamentoId\":2}]"))
                .andExpect(jsonPath("$[0].usuario").doesNotExist())
                .andExpect(jsonPath("$[0].senha").doesNotExist());
    }

    @Test
    void criarRetorna201ComDTO() throws Exception {
        when(service.criar(new RegistroRequest(1L, 2L))).thenReturn(new RegistroDTO(3L, 1L, 2L));
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuarioId\":1,\"estacionamentoId\":2}"))
                .andExpect(status().isCreated())
                .andExpect(content().json("{\"id\":3,\"usuarioId\":1,\"estacionamentoId\":2}"));
    }

    @Test
    void criarSemIdsRetorna400() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void criarComIdsNaoPositivosRetorna400() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuarioId\":0,\"estacionamentoId\":-1}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void criarPropaga404() throws Exception {
        when(service.criar(any())).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuarioId\":1,\"estacionamentoId\":2}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void criarPropaga409() throws Exception {
        when(service.criar(any())).thenThrow(new ResponseStatusException(HttpStatus.CONFLICT));
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuarioId\":1,\"estacionamentoId\":2}"))
                .andExpect(status().isConflict());
    }

    @Test
    void deletarRetorna204SemCorpo() throws Exception {
        mvc.perform(delete(URL + "/3"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
        verify(service).deletar(3L);
    }

    @Test
    void deletarInexistenteRetorna404() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(service).deletar(3L);
        mvc.perform(delete(URL + "/3")).andExpect(status().isNotFound());
    }
}