package br.com.estatec.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record RegistroDTO(Long id, Long usuarioId, Long estacionamentoId, Long carroId) {
    public RegistroDTO(Long id, Long usuarioId, Long estacionamentoId) {
        this(id, usuarioId, estacionamentoId, null);
    }
}
