package com.xs.novel.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingRecord {
    private Integer id;//记录id
    private Integer bookId;//书籍id
    private Integer chapterId;//章节id
    private String chapterName;//章节名称
    private Integer userId;//用户id
}
