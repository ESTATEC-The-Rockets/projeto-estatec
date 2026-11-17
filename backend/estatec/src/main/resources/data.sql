INSERT INTO tb_usuario (nome_usuario, cpf, email, telefone)
SELECT 'Condutor Demonstração', '12345678909', 'condutor@example.com', '11999990000'
WHERE NOT EXISTS (SELECT 1 FROM tb_usuario
    WHERE cpf = '12345678909' OR email = 'condutor@example.com' OR telefone = '11999990000');
