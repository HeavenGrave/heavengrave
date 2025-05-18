package com.xs.novel.service.impl;


import com.xs.novel.mapper.BookMapper;
import com.xs.novel.pojo.Book;
import com.xs.novel.service.BookService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class BookServiceImpl implements BookService {

    @Autowired //应用程序运行时，会自动的查询该类型的bean对象，并赋值给该成员变量
    private BookMapper bookMapper;

    /**
     * 创建书籍信息
     * @param book
     */
    public boolean saveBook(Book book){
        Integer rows=bookMapper.insertBook(book);
        return rows == 1;
    }

    public List<Book> findAll(){
        return bookMapper.findAll();
    }



    public boolean updateBook(Book book){
        Integer rows=bookMapper.updateBook(book);
        return rows == 1;
    }
}
