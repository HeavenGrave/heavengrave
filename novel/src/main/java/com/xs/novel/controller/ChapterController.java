package com.xs.novel.controller;


import com.xs.novel.pojo.Chapter;
import com.xs.novel.pojo.Result;
import com.xs.novel.service.ChapterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController //标识当前类是一个请求处理类
@RequestMapping("chapter")
@Slf4j
public class ChapterController {
    @Autowired
    private ChapterService chapterService;

    @GetMapping("/list")
    public Result list(int bookId) {
        List<Chapter> chapters = chapterService.findByBookId(bookId);
        return Result.success(chapters);
    }

    @GetMapping("/content")
    public Result content(int bookId,int chapterNum) {
        Chapter chapter = chapterService.findByBookIdAndChapterNum(bookId,chapterNum);
        return Result.success(chapter);
    }

}
