package br.com.estatec.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegistroRequest(
        @NotNull @Positive Long usuarioId,
        @NotNull @Positive Long estacionamentoId,
        @Positive Long carroId) {
    public RegistroRequest(Long usuarioId, Long estacionamentoId) {
        this(usuarioId, estacionamentoId, null);
    }
}
