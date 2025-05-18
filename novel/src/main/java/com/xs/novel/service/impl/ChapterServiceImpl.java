package com.xs.novel.service.impl;



import com.xs.novel.mapper.ChapterMapper;
import com.xs.novel.pojo.Chapter;
import com.xs.novel.service.ChapterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class ChapterServiceImpl implements ChapterService {

    @Autowired //应用程序运行时，会自动的查询该类型的bean对象，并赋值给该成员变量
    private ChapterMapper chapterMapper;

    public void saveAllChapter(List<Chapter> list_chapter) {
        chapterMapper.batchInsertChapter(list_chapter);
    }

    public List<Chapter> findByBookId(int bookId) {
        return chapterMapper.findByBookId(bookId);
    }

    public Chapter findById(int id) {
        return chapterMapper.findById(id);
    }

    public Chapter findByBookIdAndChapterNum(int bookId,int chapterNum) {
        return chapterMapper.findByBookIdAndChapterNum(bookId,chapterNum);
    }

}
