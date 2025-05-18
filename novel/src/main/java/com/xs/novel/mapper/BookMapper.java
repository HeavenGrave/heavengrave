package com.xs.novel.mapper;

import com.xs.novel.pojo.Book;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BookMapper {
    Integer insertBook (Book book);

    List<Book> findAll();

    Integer updateBook(Book book);
}
