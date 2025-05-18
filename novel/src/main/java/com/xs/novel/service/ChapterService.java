package com.xs.novel.service;

import com.xs.novel.pojo.Chapter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChapterService {
    void saveAllChapter(List<Chapter> chapters);

    List<Chapter> findByBookId(int bookId);

    Chapter findById(int id);

    Chapter findByBookIdAndChapterNum(int bookId,int chapterNum);
}
