package com.xs.novel.mapper;

import com.xs.novel.pojo.Book;
import com.xs.novel.pojo.Chapter;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ChapterMapper {

    Integer insertChapter (Chapter chapter);

    void batchInsertChapter(List<Chapter> listChapter);

    List<Chapter> findByBookId(int bookId);

    Chapter findById(int id);

    Chapter findByBookIdAndChapterNum(int bookId,int chapterNum);
}
