-- Dados iniciais do ESTATEC.
-- INSERT IGNORE permite reiniciar o sistema sem duplicar os registros.
-- As senhas de exemplo estão em texto legado e são convertidas para BCrypt no primeiro login.

INSERT IGNORE INTO tb_usuario
    (cpf, data_nascimento, email, nome_usuario, rg, senha, telefone)
VALUES
    ('111.111.111-11', '1980-05-10', 'joao@estacionamento.com', 'João Silva', '11.111.111-1', 'senha123', '(11) 91111-1111'),
    ('222.222.222-22', '1985-08-20', 'maria@estacionamento.com', 'Maria Oliveira', '22.222.222-2', 'senha123', '(11) 92222-2222'),
    ('333.333.333-33', '1990-01-15', 'ana@email.com', 'Ana Costa', '33.333.333-3', 'senha123', '(11) 93333-3333'),
    ('444.444.444-44', '1992-11-30', 'pedro@email.com', 'Pedro Lima', '44.444.444-4', 'senha123', '(11) 94444-4444'),
    ('555.555.555-55', '1995-07-25', 'bia@email.com', 'Beatriz Alves', '55.555.555-5', 'senha123', '(11) 95555-5555');

INSERT IGNORE INTO tb_estacionamento
    (nome_estacionamento, fk_dono_estacionamento)
VALUES
    ('Estacionamento Central', 1),
    ('Estacionamento Norte', 2);

INSERT IGNORE INTO tb_carros
    (placa, modelo, marca, cor, fk_dono_carro)
VALUES
    ('ABC-1234', 'Civic', 'Honda', 'PRETO', 3),
    ('XYZ-5678', 'Corolla', 'Toyota', 'BRANCO', 4),
    ('DEF-9012', 'Gol', 'Volkswagen', 'PRATA', 5);

INSERT IGNORE INTO tb_registro
    (fk_usuario, fk_estacionamento, fk_carro)
VALUES
    (3, 1, 1),
    (4, 1, 2),
    (5, 2, 3);

INSERT IGNORE INTO tb_historico
    (placa_lida, fk_carro, fk_estacionamento, data_hora, is_entrada, autorizado)
VALUES
    ('ABC-1234', 1, 1, '2026-06-17 08:00:00', 1, 1),
    ('XYZ-5678', 2, 1, '2026-06-17 09:00:00', 1, 1),
    ('DEF-9012', 3, 2, '2026-06-17 10:30:00', 1, 1),
    ('KJJ-9999', NULL, 1, '2026-06-17 11:15:00', 1, 0);