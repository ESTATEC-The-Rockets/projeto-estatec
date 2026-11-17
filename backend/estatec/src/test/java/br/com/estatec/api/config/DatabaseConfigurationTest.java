package br.com.estatec.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import static org.junit.jupiter.api.Assertions.*;

class DatabaseConfigurationTest {
    private MockEnvironment configured() {
        return new MockEnvironment().withProperty("spring.datasource.url", "jdbc:mysql://localhost:3306/teste")
            .withProperty("spring.datasource.username", "operador").withProperty("spring.datasource.password", "")
            .withProperty("spring.datasource.driverClassName", "com.mysql.cj.jdbc.Driver");
    }
    @Test void aceitaConfiguracaoCompleta() {
        assertDoesNotThrow(() -> DatabaseInitializationConfig.validarConfiguracaoDoBanco(configured())
            .postProcessBeanFactory(new DefaultListableBeanFactory()));
    }
    @Test void variavelAusenteGeraOrientacaoSemExporCredenciais() {
        var environment = configured().withProperty("spring.datasource.url", "${ESTATEC_TEST_MISSING_URL}");
        var error = assertThrows(IllegalStateException.class, () -> DatabaseInitializationConfig.validarConfiguracaoDoBanco(environment)
            .postProcessBeanFactory(new DefaultListableBeanFactory()));
        assertTrue(error.getMessage().contains("Configure DB_URL, DB_USER e DB_PASSWORD"));
    }
    @Test void rejeitaEnderecoIncompativelComDriverMySql() {
        var environment = configured().withProperty("spring.datasource.url", "jdbc:postgresql://localhost/teste");
        var error = assertThrows(IllegalStateException.class, () -> DatabaseInitializationConfig.validarConfiguracaoDoBanco(environment)
            .postProcessBeanFactory(new DefaultListableBeanFactory()));
        assertEquals("DB_URL deve começar com jdbc:mysql:// para o MySQL.", error.getMessage());
    }
}
