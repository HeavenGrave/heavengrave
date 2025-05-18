package com.xs.novel.service;

import com.xs.novel.pojo.Book;
import com.xs.novel.pojo.ReadingRecord;
import org.springframework.stereotype.Service;

@Service
public interface ReadingRecordService {
    /**
     * 保持书籍信息
     * @param readingRecord
     * @return
     */
    boolean saveReadingRecord(ReadingRecord  readingRecord);

    ReadingRecord findByUserIdAndBookId(int bookId, int userId);
}
