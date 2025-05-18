package web.sn.dream;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import web.sn.dream.service.MaJiangService;

import java.time.LocalDateTime;
@SpringBootTest
public class MaJiangTest {

    @Autowired
    private MaJiangService maJiangService;
    @Test
    public void cleanupMaJiangData(){
        // 在这里编写清理数据库中MaJiang表的逻辑
        maJiangService.deleteAllData();
    }
}
