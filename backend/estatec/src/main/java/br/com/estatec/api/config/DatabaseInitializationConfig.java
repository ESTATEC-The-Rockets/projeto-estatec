package br.com.estatec.api.config;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.context.annotation.*;
import org.springframework.boot.jdbc.autoconfigure.ApplicationDataSourceScriptDatabaseInitializer;
import org.springframework.boot.sql.autoconfigure.init.SqlInitializationProperties;

@Configuration
@org.springframework.boot.context.properties.EnableConfigurationProperties(SqlInitializationProperties.class)
public class DatabaseInitializationConfig {
    @Bean
    static org.springframework.beans.factory.config.BeanFactoryPostProcessor validarConfiguracaoDoBanco(
            org.springframework.core.env.Environment environment) {
        return factory -> {
            String url;
            String user;
            try {
                url = environment.getProperty("spring.datasource.url");
                user = environment.getProperty("spring.datasource.username");
                environment.getRequiredProperty("spring.datasource.password");
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException("Configure DB_URL, DB_USER e DB_PASSWORD no arquivo .env ou no ambiente antes de iniciar a API.");
            }
            if (url == null || !url.startsWith("jdbc:") || user == null || user.isBlank()) {
                throw new IllegalStateException("Configure DB_URL com um endereço JDBC e DB_USER no arquivo .env ou no ambiente antes de iniciar a API.");
            }
            if ("com.mysql.cj.jdbc.Driver".equals(environment.getProperty("spring.datasource.driverClassName"))
                    && !url.startsWith("jdbc:mysql://")) {
                throw new IllegalStateException("DB_URL deve começar com jdbc:mysql:// para o MySQL.");
            }
        };
    }

    @Bean
    @DependsOn("entityManagerFactory")
    ApplicationDataSourceScriptDatabaseInitializer dataSourceScriptDatabaseInitializer(
            DataSource dataSource, SqlInitializationProperties properties) {
        return new ApplicationDataSourceScriptDatabaseInitializer(dataSource, properties) {
            @Override public boolean initializeDatabase() {
                liberarCamposLegados(dataSource);
                return super.initializeDatabase();
            }
        };
    }

    // O Hibernate nao remove NOT NULL de colunas que deixaram de fazer parte do modelo.
    // Preserva os valores antigos, permitindo novos cadastros sem esses campos.
    public static void liberarCamposLegados(DataSource source) {
        try (Connection connection = source.getConnection()) {
            String product = connection.getMetaData().getDatabaseProductName();
            boolean mysql = product.equals("MySQL") || product.equals("MariaDB");
            if (!mysql && !product.equals("H2")) return;
            String table = mysql ? "tb_usuario" : "TB_USUARIO";
            Map<String, String> types = Map.of("senha", "VARCHAR(255)", "rg", "VARCHAR(12)", "data_nascimento", "DATE");
            for (var field : types.entrySet()) {
                boolean required;
                try (var columns = connection.getMetaData().getColumns(connection.getCatalog(), null, table,
                        mysql ? field.getKey() : field.getKey().toUpperCase(java.util.Locale.ROOT))) {
                    required = columns.next() && columns.getInt("NULLABLE") == java.sql.DatabaseMetaData.columnNoNulls;
                }
                if (required) {
                    String sql = mysql ? "ALTER TABLE tb_usuario MODIFY COLUMN " + field.getKey() + " " + field.getValue() + " NULL"
                        : "ALTER TABLE tb_usuario ALTER COLUMN " + field.getKey() + " DROP NOT NULL";
                    try (var statement = connection.createStatement()) { statement.execute(sql); }
                }
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Falha ao atualizar campos legados do cadastro de condutores.", ex);
        }
    }
}
