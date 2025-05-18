package com.xs.novel.service;

import com.xs.novel.pojo.Book;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BookService {
    /**
     * 保持书籍信息
     * @param book
     * @return
     */
    boolean saveBook(Book book);

    List<Book> findAll();

    boolean updateBook(Book book);
}
