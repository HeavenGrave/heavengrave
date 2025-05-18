package com.xs.novel.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    private Integer id;//书籍id
    private String name;//书籍名称
    private String author;//作者
    private String coverUrl;//封面图片
    private Integer chapters;//章节数
    private String des;//书籍描述
}
