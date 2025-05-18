package web.sn.dream.coomon;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import web.sn.dream.service.MaJiangService;

@Component
public class DatabaseCleanupTask {
        @Autowired
        private MaJiangService maJiangService;

        // 定时任务方法，每个月的第一天凌晨执行
        @Scheduled(cron = "0 0 0 1 * ?")
        public void cleanupDaosanTable() {
                // 在这里编写清理数据库中daosan表的逻辑
                maJiangService.deleteAllData();
        }

        // 定时任务方法，每个小时
        @Scheduled(cron = "0 0 0/1 * * ?")
        public void cleanupMaJiangTable() {
                // 在这里编写清理数据库中MaJiang表的逻辑
                maJiangService.deleteOutTimeMaJiang();
        }
}