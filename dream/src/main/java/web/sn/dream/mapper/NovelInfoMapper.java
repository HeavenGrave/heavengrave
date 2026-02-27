package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.NovelInfo;
import web.sn.dream.pojo.Renovation;

import java.util.List;

@Mapper
public interface NovelInfoMapper {
    //增删改查
    Integer insertNovelInfo(NovelInfo novelInfo);
    void  updateNovelInfo(NovelInfo novelInfo);
    NovelInfo  findNovelInfoById(int id);
    void deleteNovelInfoById(int id);
    List<NovelInfo> findNovelInfoByCond(String brand, String cond, String timeSort);
    List<NovelInfo> findAllNovelInfo();
    void batchInsertNovelInfo(List<NovelInfo> infos);

    List<NovelInfo> findNovelInfoByNovelNameToPage(String novelName, int startNum, int pageSize);

    void deleteNovelInfoByNovelName(String novelName);

    List<NovelInfo> findNovelInfoByCondToPage(String novelName, Integer chapterNum, String actorName, String emotion, int startNum, int pageSize);

    int findNovelInfoByCondCount(String novelName, Integer chapterNum, String actorName, String emotion);

    List<NovelInfo> findNovelInfoByNoAudio(String novelName);

    int findNovelInfoChapterCount(String novelName);

    List<NovelInfo> findNovelInfoByNovelNameAndChapterNum(String novelName, int chapterNum);

    List<NovelInfo> findNovelInfoByHaveAudio(String novelName);
}
