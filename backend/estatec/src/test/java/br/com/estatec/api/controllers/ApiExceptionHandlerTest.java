package br.com.estatec.api.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import br.com.estatec.api.entities.Estacionamento;
import jakarta.validation.Valid;

class ApiExceptionHandlerTest {
    @RestController
    static class TestController {
        @PostMapping("/estacionamento") Estacionamento cadastrar(@Valid @RequestBody Estacionamento value) { return value; }
        @GetMapping("/falha") void falha() { throw new IllegalStateException("nomeEstacionamento: java.sql.SQLException com detalhes internos"); }
        @GetMapping("/motivo") void motivo() { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nomeEstacionamento java.sql.Exception"); }
    }
    private org.springframework.test.web.servlet.MockMvc mvc() {
        return MockMvcBuilders.standaloneSetup(new TestController()).setControllerAdvice(new ApiExceptionHandler()).build();
    }
    @Test void validaNomeSemExporAtributosENaoRejeitaNomeValido() throws Exception {
        var mvc = mvc();
        mvc.perform(post("/estacionamento").contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\"" + "a".repeat(101) + "\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("NAME_LONG"))
            .andExpect(jsonPath("$.message").value("Use um nome mais curto."))
            .andExpect(jsonPath("$.errors").doesNotExist()).andExpect(jsonPath("$.trace").doesNotExist());
        mvc.perform(post("/estacionamento").contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\"  \"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("Informe um nome para o estacionamento."));
        for (String nome : new String[]{"penha", "123", "Pátio São João #2 - 24h & Cia.", "Garagem / Bloco_A (VIP)"}) {
            mvc.perform(post("/estacionamento").contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":\"" + nome + "\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nomeEstacionamento").value(nome));
        }
    }
    @Test void detalhesDeFalhasFicamForaDaResposta() throws Exception {
        var mvc = mvc();
        mvc.perform(get("/falha")).andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.message").value("Tente novamente em instantes."))
            .andExpect(jsonPath("$.exception").doesNotExist()).andExpect(jsonPath("$.trace").doesNotExist());
        mvc.perform(get("/motivo")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Confira os dados informados."));
        mvc.perform(post("/estacionamento").contentType(MediaType.APPLICATION_JSON).content("{\"nomeEstacionamento\":{\"sql\":true}}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("Confira os dados informados."));
    }
}
