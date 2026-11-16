package br.com.estatec.api.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/** Conta de quem opera o sistema; independente do cadastro de condutores. */
@Entity
@Table(name = "tb_conta_acesso")
public class ContaAcesso {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String nome;
    @Column(nullable = false, unique = true, length = 120)
    private String email;
    @JsonIgnore
    @Column(name = "senha_hash", nullable = false, length = 60)
    private String senhaHash;
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    @JsonIgnore public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
}
