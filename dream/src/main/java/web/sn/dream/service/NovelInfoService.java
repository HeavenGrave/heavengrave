package web.sn.dream.service;

import org.springframework.stereotype.Service;
import web.sn.dream.pojo.NovelInfo;

import java.util.List;

@Service
public interface NovelInfoService {
    Integer insertNovelInfo(NovelInfo novelInfo);
    void  updateNovelInfo(NovelInfo novelInfo);
    NovelInfo  findNovelInfoById(int id);
    void deleteNovelInfoById(int id);
    List<NovelInfo> findNovelInfoByCond(String brand, String cond, String timeSort);
    List<NovelInfo> findAllNovelInfo();

    void batchInsertNovelInfo(List<NovelInfo> infos);

    List<NovelInfo> findNovelInfoByNovelNameToPage(String novelName, int pageNum, int pageSize);

    void deleteNovelInfoByNovelName(String novelName);

    List<NovelInfo> findNovelInfoByCondToPage(String novelName, Integer chapterNum, String actorName, String emotion, int pageNum, int pageSize);

    int findNovelInfoByCondCount(String novelName, Integer chapterNum, String actorName, String emotion);

    List<NovelInfo> findNovelInfoByNoAudio(String novelName);

    int findNovelInfoChapterCount(String novelName);

    List<NovelInfo> findNovelInfoByNovelNameAndChapterNum(String novelName, int chapterNum);

    List<NovelInfo> findNovelInfoByHaveAudio(String novelName);
}
