package com.xs.novel.controller;


import com.xs.novel.pojo.ReadingRecord;
import com.xs.novel.pojo.Result;
import com.xs.novel.service.ReadingRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController //标识当前类是一个请求处理类
@RequestMapping("record")
@Slf4j
public class ReadingRecordController {
    @Autowired
    private ReadingRecordService readingRecordService;

    @GetMapping("/user")
    public Result list(int bookId, int userId) {
        ReadingRecord readingRecord = readingRecordService.findByUserIdAndBookId(bookId,userId);
        return Result.success(readingRecord);
    }

}
