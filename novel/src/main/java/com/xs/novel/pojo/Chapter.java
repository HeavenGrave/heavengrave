package com.xs.novel.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    private Integer id;//章节id
    private String name;//章节名称
    private Integer chapterNum;//章节号
    private String content;//内容
    private Integer words;//字数
    private Integer bookId;//书籍id
}
