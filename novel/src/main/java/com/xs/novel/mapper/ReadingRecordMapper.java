package com.xs.novel.mapper;


import com.xs.novel.pojo.ReadingRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReadingRecordMapper {
    Integer insertReadingRecord (ReadingRecord readingRecord);

    ReadingRecord findByUserIdAndBookId(int userId, int bookId);
}
