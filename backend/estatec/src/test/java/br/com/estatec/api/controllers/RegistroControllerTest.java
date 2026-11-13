package br.com.estatec.api.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import br.com.estatec.api.entities.Estacionamento;
import br.com.estatec.api.entities.Registro;
import br.com.estatec.api.entities.Usuario;
import br.com.estatec.api.services.RegistroService;
import br.com.estatec.api.services.CarroService;
import br.com.estatec.api.services.EstacionamentoService;
import br.com.estatec.api.config.AccessControl;

class RegistroControllerTest {
    private static final String URL = "/estacionamento/registros";
    private RegistroService service;
    private MockMvc mvc;

    @BeforeEach
    void prepararController() {
        service = mock(RegistroService.class);
        AccessControl access = mock(AccessControl.class);
        when(access.isAdmin(any())).thenReturn(true);
        EstacionamentoService estacionamentos = mock(EstacionamentoService.class);
        when(estacionamentos.buscarPorId(2L)).thenReturn(registro().getEstacionamento());
        when(access.currentUser(any())).thenReturn(registro().getUsuario());
        when(service.buscarPorId(3L)).thenReturn(registro());
        mvc = MockMvcBuilders.standaloneSetup(new RegistroController(
                service, access, mock(CarroService.class), estacionamentos)).build();
    }

    private Registro registro() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        Estacionamento estacionamento = new Estacionamento();
        estacionamento.setIdEstacionamento(2L);
        Registro registro = new Registro(usuario, estacionamento);
        registro.setId(3L);
        return registro;
    }

    @Test
    void listarRetornaEntidades() throws Exception {
        when(service.listarTodos()).thenReturn(List.of(registro()));
        mvc.perform(get(URL)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(3))
                .andExpect(jsonPath("$[0].usuario.id").value(1))
                .andExpect(jsonPath("$[0].estacionamento.idEstacionamento").value(2))
                .andExpect(jsonPath("$[0].usuario.senha").doesNotExist());
    }

    @Test
    void criarRecebeEntidadeComRelacionamentos() throws Exception {
        when(service.criar(any(Registro.class))).thenReturn(registro());
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuario\":{\"id\":1},\"estacionamento\":{\"idEstacionamento\":2}}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(3));
        verify(service).criar(any(Registro.class));
    }

    @Test
    void deletarRetorna204() throws Exception {
        mvc.perform(delete(URL + "/3")).andExpect(status().isNoContent()).andExpect(content().string(""));
        verify(service).deletar(3L);
    }
}
