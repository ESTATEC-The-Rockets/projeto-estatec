package br.com.estatec.api.controllers;

import java.util.Map;
import org.springframework.http.ResponseEntity;

/** Apenas mensagens aprovadas podem ser exibidas nas telas. */
public final class Avisos {
    private Avisos() {}
    public static final Map<String, String> TEXTOS = Map.ofEntries(
        Map.entry("INVITE_INVALID", "Informe um código de convite válido."),
        Map.entry("MOVEMENT_REQUIRED", "Informe entrada ou saída."),
        Map.entry("HISTORY_NOT_FOUND", "Movimentação não encontrada."),
        Map.entry("TRY_AGAIN", "Tente novamente em instantes."),
        Map.entry("CHECK_DATA", "Confira os dados informados."),
        Map.entry("SIGN_IN", "Entre novamente para continuar."),
        Map.entry("NO_PERMISSION", "Você não tem permissão para esta ação."),
        Map.entry("NOT_FOUND", "O cadastro não foi encontrado."),
        Map.entry("CONFLICT", "Confira se este cadastro já existe."),
        Map.entry("METHOD_NOT_ALLOWED", "Esta ação não está disponível."),
        Map.entry("SAVE_CONFLICT", "Não foi possível salvar este cadastro."),
        Map.entry("DELETE_CONFLICT", "Remova os cadastros associados antes de excluir."),
        Map.entry("NAME_REQUIRED", "Informe o nome."),
        Map.entry("NAME_INVALID", "Informe um nome válido."),
        Map.entry("NAME_LONG", "Use um nome mais curto."),
        Map.entry("PARKING_NAME_REQUIRED", "Informe um nome para o estacionamento."),
        Map.entry("EMAIL_REQUIRED", "Informe o e-mail."),
        Map.entry("EMAIL_INVALID", "Informe um e-mail válido."),
        Map.entry("EMAIL_LONG", "Use um e-mail mais curto."),
        Map.entry("PASSWORD_REQUIRED", "Informe a senha."),
        Map.entry("PASSWORD_SHORT", "Use pelo menos 8 caracteres na senha."),
        Map.entry("PASSWORD_LONG", "Use uma senha mais curta."),
        Map.entry("PASSWORD_CONFIRM_REQUIRED", "Confirme a senha."),
        Map.entry("PASSWORD_MISMATCH", "As senhas não conferem."),
        Map.entry("LOGIN_INVALID", "E-mail ou senha incorretos."),
        Map.entry("ACCOUNT_EXISTS", "Já existe uma conta com este e-mail."),
        Map.entry("CPF_REQUIRED", "Informe o CPF."),
        Map.entry("CPF_INVALID", "Informe um CPF válido."),
        Map.entry("PHONE_REQUIRED", "Informe o telefone."),
        Map.entry("PHONE_INVALID", "Informe um telefone válido com DDD."),
        Map.entry("BRAND_REQUIRED", "Informe a marca do carro."),
        Map.entry("BRAND_LENGTH", "A marca deve ter entre 2 e 50 caracteres."),
        Map.entry("MODEL_REQUIRED", "Informe o modelo do carro."),
        Map.entry("MODEL_LENGTH", "O modelo deve ter entre 2 e 50 caracteres."),
        Map.entry("PLATE_REQUIRED", "Informe a placa do carro."),
        Map.entry("PLATE_INVALID", "Informe uma placa válida."),
        Map.entry("CAR_REQUIRED", "Selecione um carro."),
        Map.entry("DRIVER_REQUIRED", "Selecione um condutor."),
        Map.entry("PARKING_REQUIRED", "Selecione um estacionamento."),
        Map.entry("CAR_NOT_FOUND", "Carro não encontrado."),
        Map.entry("DRIVER_NOT_FOUND", "Condutor não encontrado."),
        Map.entry("PARKING_NOT_FOUND", "Estacionamento não encontrado."),
        Map.entry("REGISTRATION_NOT_FOUND", "O vínculo não foi encontrado."),
        Map.entry("CAR_EXISTS", "Esta placa já está cadastrada."),
        Map.entry("PARKING_EXISTS", "Já existe um estacionamento com este nome."),
        Map.entry("DRIVER_EXISTS", "CPF, e-mail ou telefone já cadastrado."),
        Map.entry("REGISTRATION_EXISTS", "Este carro já está neste estacionamento."),
        Map.entry("WRONG_DRIVER", "Este carro pertence a outro condutor."),
        Map.entry("DRIVER_FIXED", "O condutor deste carro não pode ser alterado."),
        Map.entry("MISSING_DRIVER", "Selecione um condutor para este carro."),
        Map.entry("DRIVER_HAS_CARS", "Exclua os carros antes de remover o condutor."),
        Map.entry("ACCESS_DENIED", "Acesso não autorizado."));
    private static final Map<String, String> MOTIVOS = Map.ofEntries(
        Map.entry("Informe entrada ou saída.", "MOVEMENT_REQUIRED"),
        Map.entry("Informe uma placa válida.", "PLATE_INVALID"),
        Map.entry("Histórico não encontrado.", "HISTORY_NOT_FOUND"),
        Map.entry("Condutor inexistente.", "DRIVER_NOT_FOUND"),
        Map.entry("Condutor não encontrado.", "DRIVER_NOT_FOUND"),
        Map.entry("Carro não encontrado.", "CAR_NOT_FOUND"),
        Map.entry("Estacionamento não encontrado.", "PARKING_NOT_FOUND"),
        Map.entry("Registro não encontrado.", "REGISTRATION_NOT_FOUND"),
        Map.entry("A placa do carro é obrigatória.", "PLATE_REQUIRED"),
        Map.entry("Já existe um carro cadastrado com esta placa.", "CAR_EXISTS"),
        Map.entry("Já existe outro carro cadastrado com esta placa.", "CAR_EXISTS"),
        Map.entry("Este carro legado precisa de um condutor antes de ser editado.", "MISSING_DRIVER"),
        Map.entry("O condutor do carro não pode ser alterado por esta operação.", "DRIVER_FIXED"),
        Map.entry("Este registro já existe.", "REGISTRATION_EXISTS"),
        Map.entry("Não foi possível criar o registro por conflito de integridade.", "REGISTRATION_EXISTS"),
        Map.entry("O carro selecionado não pertence ao condutor.", "WRONG_DRIVER"),
        Map.entry("Condutor é obrigatório.", "DRIVER_REQUIRED"),
        Map.entry("Estacionamento é obrigatório.", "PARKING_REQUIRED"),
        Map.entry("Selecione o carro a vincular ao estacionamento.", "CAR_REQUIRED"),
        Map.entry("Estacionamento já existe.", "PARKING_EXISTS"),
        Map.entry("As senhas não conferem.", "PASSWORD_MISMATCH"),
        Map.entry("A senha deve ter no máximo 72 bytes em UTF-8.", "PASSWORD_LONG"),
        Map.entry("Este e-mail já possui uma conta. Entre com sua senha.", "ACCOUNT_EXISTS"),
        Map.entry("Chave de acesso inválida.", "ACCESS_DENIED"),
        Map.entry("Informe placa e estacionamentoId.", "PARKING_REQUIRED"),
        Map.entry("estacionamentoId inválido.", "PARKING_REQUIRED"),
        Map.entry("Acesso negado.", "NO_PERMISSION"),
        Map.entry("CPF, e-mail ou telefone já cadastrado para outro condutor.", "DRIVER_EXISTS"),
        Map.entry("Exclua os carros deste condutor antes de remover seu cadastro.", "DRIVER_HAS_CARS"),
        Map.entry("Tente novamente em instantes.", "TRY_AGAIN"),
        Map.entry("Confira os dados informados.", "CHECK_DATA"),
        Map.entry("Entre novamente para continuar.", "SIGN_IN"),
        Map.entry("Você não tem permissão para esta ação.", "NO_PERMISSION"),
        Map.entry("O cadastro não foi encontrado.", "NOT_FOUND"),
        Map.entry("Confira se este cadastro já existe.", "CONFLICT"),
        Map.entry("Esta ação não está disponível.", "METHOD_NOT_ALLOWED"),
        Map.entry("Não foi possível salvar este cadastro.", "SAVE_CONFLICT"),
        Map.entry("Remova os cadastros associados antes de excluir.", "DELETE_CONFLICT"),
        Map.entry("Informe o nome.", "NAME_REQUIRED"),
        Map.entry("Informe um nome válido.", "NAME_INVALID"),
        Map.entry("Use um nome mais curto.", "NAME_LONG"),
        Map.entry("Informe um nome para o estacionamento.", "PARKING_NAME_REQUIRED"),
        Map.entry("Informe o e-mail.", "EMAIL_REQUIRED"),
        Map.entry("Informe um e-mail válido.", "EMAIL_INVALID"),
        Map.entry("Use um e-mail mais curto.", "EMAIL_LONG"),
        Map.entry("Informe a senha.", "PASSWORD_REQUIRED"),
        Map.entry("Use pelo menos 8 caracteres na senha.", "PASSWORD_SHORT"),
        Map.entry("Use uma senha mais curta.", "PASSWORD_LONG"),
        Map.entry("Confirme a senha.", "PASSWORD_CONFIRM_REQUIRED"),
        Map.entry("E-mail ou senha incorretos.", "LOGIN_INVALID"),
        Map.entry("Já existe uma conta com este e-mail.", "ACCOUNT_EXISTS"),
        Map.entry("Informe o CPF.", "CPF_REQUIRED"),
        Map.entry("Informe um CPF válido.", "CPF_INVALID"),
        Map.entry("Informe o telefone.", "PHONE_REQUIRED"),
        Map.entry("Informe um telefone válido com DDD.", "PHONE_INVALID"),
        Map.entry("Informe a marca do carro.", "BRAND_REQUIRED"),
        Map.entry("A marca deve ter entre 2 e 50 caracteres.", "BRAND_LENGTH"),
        Map.entry("Informe o modelo do carro.", "MODEL_REQUIRED"),
        Map.entry("O modelo deve ter entre 2 e 50 caracteres.", "MODEL_LENGTH"),
        Map.entry("Informe a placa do carro.", "PLATE_REQUIRED"),
        Map.entry("Selecione um carro.", "CAR_REQUIRED"),
        Map.entry("Selecione um condutor.", "DRIVER_REQUIRED"),
        Map.entry("Selecione um estacionamento.", "PARKING_REQUIRED"),
        Map.entry("O vínculo não foi encontrado.", "REGISTRATION_NOT_FOUND"),
        Map.entry("Esta placa já está cadastrada.", "CAR_EXISTS"),
        Map.entry("Já existe um estacionamento com este nome.", "PARKING_EXISTS"),
        Map.entry("Este carro já está neste estacionamento.", "REGISTRATION_EXISTS"),
        Map.entry("Este carro pertence a outro condutor.", "WRONG_DRIVER"),
        Map.entry("O condutor deste carro não pode ser alterado.", "DRIVER_FIXED"),
        Map.entry("Selecione um condutor para este carro.", "MISSING_DRIVER"),
        Map.entry("Exclua os carros antes de remover o condutor.", "DRIVER_HAS_CARS"),
        Map.entry("Acesso não autorizado.", "ACCESS_DENIED"));
    public static String padrao(int status) {
        return switch (status) {
            case 400, 422 -> "CHECK_DATA";
            case 401 -> "SIGN_IN";
            case 403 -> "NO_PERMISSION";
            case 404 -> "NOT_FOUND";
            case 405 -> "METHOD_NOT_ALLOWED";
            case 409 -> "CONFLICT";
            default -> "TRY_AGAIN";
        };
    }
    public static String motivo(String reason, int status) {
        return status >= 500 || reason == null ? padrao(status) : MOTIVOS.getOrDefault(reason, padrao(status));
    }
    public static Map<String, String> corpo(String code) {
        String key = TEXTOS.containsKey(code) ? code : "TRY_AGAIN";
        return Map.of("code", key, "message", TEXTOS.get(key));
    }
    public static ResponseEntity<?> resposta(int status, String code) {
        return ResponseEntity.status(status).body(corpo(code));
    }
}
