package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.NovelInfoMapper;
import web.sn.dream.mapper.NovelInfoMapper;
import web.sn.dream.pojo.NovelInfo;
import web.sn.dream.service.NovelInfoService;
import web.sn.dream.service.NovelInfoService;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class NovelInfoServiceImpl implements NovelInfoService {
    @Autowired
    private NovelInfoMapper novelInfoMapper;
    @Override
    public void updateNovelInfo(NovelInfo novelInfo) {
        novelInfoMapper.updateNovelInfo(novelInfo);
    }
    @Override
    public void deleteNovelInfoById(int id) {
        novelInfoMapper.deleteNovelInfoById(id);
    }
    @Override
    public Integer insertNovelInfo(NovelInfo novelInfo) {
        return novelInfoMapper.insertNovelInfo(novelInfo);
    }
    @Override
    public NovelInfo findNovelInfoById(int id) {
        return novelInfoMapper.findNovelInfoById(id);
    }
    @Override
    public List<NovelInfo> findNovelInfoByCond(String brand, String cond, String timeSort) {
        return novelInfoMapper.findNovelInfoByCond(brand,cond,timeSort);
    }
    @Override
    public List<NovelInfo> findAllNovelInfo() {
        return novelInfoMapper.findAllNovelInfo();
    }

    @Override
    public void batchInsertNovelInfo(List<NovelInfo> infos){
        log.info("批量插入数据开始");
        if(infos.size()>100){
            int startNum=0;
            while (startNum<infos.size()){
                List<NovelInfo> subList = new ArrayList<>();
                if(startNum+100>infos.size()){
                    subList=infos.subList(startNum, infos.size());
                }else {
                    subList=infos.subList(startNum, startNum+100);
                }
                novelInfoMapper.batchInsertNovelInfo(subList);
                startNum+=100;
            }
        }else {
            novelInfoMapper.batchInsertNovelInfo(infos);
        }
        log.info("批量插入数据结束");
    }

    @Override
    public List<NovelInfo> findNovelInfoByNovelNameToPage(String novelName, int pageNum, int pageSize) {
        log.info("开始查询小说名：{}",novelName);
        log.info("页码：{}",pageNum);
        log.info("页大小：{}",pageSize);
        log.info("开始查询");
        int startNum=(pageNum-1)*pageSize;
        return novelInfoMapper.findNovelInfoByNovelNameToPage(novelName,startNum,pageSize);
    }

    @Override
    public void deleteNovelInfoByNovelName(String novelName) {
        novelInfoMapper.deleteNovelInfoByNovelName(novelName);
    }

    @Override
    public List<NovelInfo> findNovelInfoByCondToPage(String novelName, Integer chapterNum, String actorName, String emotion, int pageNum, int pageSize){
        int startNum=(pageNum-1)*pageSize;
        return novelInfoMapper.findNovelInfoByCondToPage(novelName,chapterNum,actorName, emotion, startNum, pageSize);
    }

    @Override
    public int findNovelInfoByCondCount(String novelName, Integer chapterNum, String actorName, String emotion){
        return novelInfoMapper.findNovelInfoByCondCount(novelName,chapterNum,actorName, emotion);
    }

    @Override
    public List<NovelInfo> findNovelInfoByNoAudio(String novelName){
        return novelInfoMapper.findNovelInfoByNoAudio(novelName);
    }

    @Override
    public int findNovelInfoChapterCount(String novelName) {
        return novelInfoMapper.findNovelInfoChapterCount(novelName);
    }

    @Override
    public List<NovelInfo> findNovelInfoByNovelNameAndChapterNum(String novelName, int chapterNum){
        return novelInfoMapper.findNovelInfoByNovelNameAndChapterNum(novelName,chapterNum);
    }

    @Override
    public List<NovelInfo> findNovelInfoByHaveAudio(String novelName){
        return novelInfoMapper.findNovelInfoByHaveAudio(novelName);
    }

}
