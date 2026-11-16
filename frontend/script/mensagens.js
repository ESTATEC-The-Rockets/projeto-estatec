/* Avisos publicos: nunca exibir texto arbitrario recebido em uma falha. */
(function () {
    const texts = Object.freeze({
    "MOVEMENT_REQUIRED": "Informe entrada ou saída.",
    "HISTORY_NOT_FOUND": "Movimentação não encontrada.",
    "TRY_AGAIN": "Tente novamente em instantes.",
    "CHECK_DATA": "Confira os dados informados.",
    "SIGN_IN": "Entre novamente para continuar.",
    "NO_PERMISSION": "Você não tem permissão para esta ação.",
    "NOT_FOUND": "O cadastro não foi encontrado.",
    "CONFLICT": "Confira se este cadastro já existe.",
    "METHOD_NOT_ALLOWED": "Esta ação não está disponível.",
    "SAVE_CONFLICT": "Não foi possível salvar este cadastro.",
    "DELETE_CONFLICT": "Remova os cadastros associados antes de excluir.",
    "NAME_REQUIRED": "Informe o nome.",
    "NAME_INVALID": "Informe um nome válido.",
    "NAME_LONG": "Use um nome mais curto.",
    "PARKING_NAME_REQUIRED": "Informe um nome para o estacionamento.",
    "EMAIL_REQUIRED": "Informe o e-mail.",
    "EMAIL_INVALID": "Informe um e-mail válido.",
    "EMAIL_LONG": "Use um e-mail mais curto.",
    "PASSWORD_REQUIRED": "Informe a senha.",
    "PASSWORD_SHORT": "Use pelo menos 8 caracteres na senha.",
    "PASSWORD_LONG": "Use uma senha mais curta.",
    "PASSWORD_CONFIRM_REQUIRED": "Confirme a senha.",
    "PASSWORD_MISMATCH": "As senhas não conferem.",
    "LOGIN_INVALID": "E-mail ou senha incorretos.",
    "ACCOUNT_EXISTS": "Já existe uma conta com este e-mail.",
    "CPF_REQUIRED": "Informe o CPF.",
    "CPF_INVALID": "Informe um CPF válido.",
    "PHONE_REQUIRED": "Informe o telefone.",
    "PHONE_INVALID": "Informe um telefone válido com DDD.",
    "BRAND_REQUIRED": "Informe a marca do carro.",
    "BRAND_LENGTH": "A marca deve ter entre 2 e 50 caracteres.",
    "MODEL_REQUIRED": "Informe o modelo do carro.",
    "MODEL_LENGTH": "O modelo deve ter entre 2 e 50 caracteres.",
    "PLATE_REQUIRED": "Informe a placa do carro.",
    "PLATE_INVALID": "Informe uma placa válida.",
    "CAR_REQUIRED": "Selecione um carro.",
    "DRIVER_REQUIRED": "Selecione um condutor.",
    "PARKING_REQUIRED": "Selecione um estacionamento.",
    "CAR_NOT_FOUND": "Carro não encontrado.",
    "DRIVER_NOT_FOUND": "Condutor não encontrado.",
    "PARKING_NOT_FOUND": "Estacionamento não encontrado.",
    "REGISTRATION_NOT_FOUND": "O vínculo não foi encontrado.",
    "CAR_EXISTS": "Esta placa já está cadastrada.",
    "PARKING_EXISTS": "Já existe um estacionamento com este nome.",
    "DRIVER_EXISTS": "CPF, e-mail ou telefone já cadastrado.",
    "REGISTRATION_EXISTS": "Este carro já está neste estacionamento.",
    "WRONG_DRIVER": "Este carro pertence a outro condutor.",
    "DRIVER_FIXED": "O condutor deste carro não pode ser alterado.",
    "MISSING_DRIVER": "Selecione um condutor para este carro.",
    "DRIVER_HAS_CARS": "Exclua os carros antes de remover o condutor.",
    "ACCESS_DENIED": "Acesso não autorizado."
});
    class UserNotice extends Error {}
    const failure = message => new UserNotice(message);
    const fallbackFor = status => ({400:'CHECK_DATA',401:'SIGN_IN',403:'NO_PERMISSION',404:'NOT_FOUND',405:'METHOD_NOT_ALLOWED',409:'CONFLICT',422:'CHECK_DATA'})[status] || 'TRY_AGAIN';
    const fromResponse = (body, status) => typeof body?.code === 'string' && Object.hasOwn(texts, body.code) ? texts[body.code] : texts[fallbackFor(status)];
    const error = (value, fallback = texts.TRY_AGAIN) => value instanceof UserNotice ? value.message : fallback;
    const invalid = field => {
        if (field.validity?.customError && Object.values(texts).includes(field.validationMessage)) return field.validationMessage;
        const name = field.name || field.id || '';
        if (/email/i.test(name)) return texts.EMAIL_INVALID;
        if (/confirma/i.test(name)) return texts.PASSWORD_CONFIRM_REQUIRED;
        if (/senha|password/i.test(name)) return field.validity?.tooShort ? texts.PASSWORD_SHORT : texts.PASSWORD_REQUIRED;
        if (/telefone/i.test(name)) return texts.PHONE_INVALID;
        if (/cpf/i.test(name)) return texts.CPF_INVALID;
        if (/placa/i.test(name)) return texts.PLATE_INVALID;
        if (/marca/i.test(name)) return texts.BRAND_REQUIRED;
        if (/modelo/i.test(name)) return texts.MODEL_REQUIRED;
        if (/cor/i.test(name)) return 'Selecione uma cor.';
        if (/nome|name/i.test(name)) return texts.NAME_REQUIRED;
        return texts.CHECK_DATA;
    };
    const api = { texts, failure, fromResponse, error, invalid };
    if (typeof window !== 'undefined') window.EstatecMessages = api;
    if (typeof module !== 'undefined') module.exports = api;
})();
