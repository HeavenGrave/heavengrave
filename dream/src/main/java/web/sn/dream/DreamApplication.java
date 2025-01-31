package web.sn.dream;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@SpringBootApplication
public class DreamApplication {

    public static void main(String[] args) {
        SpringApplication.run(DreamApplication.class, args);
    }

    /**
     * 初始化数据库连接池
     * @param dataSource
     * @return
     */
    @Bean
    public CommandLineRunner initDatabase(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                // 执行一个简单的查询来预热连接池
                connection.createStatement().execute("SELECT 1");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        };
    }
}
