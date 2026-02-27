package web.sn.dream.coomon;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import web.sn.dream.pojo.NovelInfo;
import web.sn.dream.service.MaJiangService;
import web.sn.dream.service.NovelInfoService;
import web.sn.dream.utils.FileUtil;

import java.util.List;

@Component
public class DatabaseCleanupTask {
        @Autowired
        private MaJiangService maJiangService;
        @Autowired
        private NovelInfoService novelInfoService;



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

        // 定时任务方法，每一天凌晨执行
        @Scheduled(cron = "0 1 0 * * *")
        public void auto_text_to_audio() {
                List<NovelInfo> list_novelInfo =novelInfoService.findNovelInfoByNoAudio(null);
                for(NovelInfo novelInfo:list_novelInfo){
                        if(novelInfo.getActorVoice()!=null&&!novelInfo.getActorVoice().isEmpty()) {
                                String filePath = FileUtil.TEXT_TO_AUDIO(novelInfo.getContent(), novelInfo.getActorVoice(), novelInfo.getSpeechRate().intValue(), novelInfo.getTone(), novelInfo.getEmotion(), novelInfo.getChapterNum(), novelInfo.getIndex());
                                novelInfo.setNovelVoiceUrl(filePath);
                                novelInfoService.updateNovelInfo(novelInfo);
                        }
                }
        }
}