package com.xs.novel.service.impl;



import com.xs.novel.mapper.ReadingRecordMapper;
import com.xs.novel.pojo.ReadingRecord;
import com.xs.novel.service.ReadingRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class ReadingRecordServiceImpl implements ReadingRecordService {

    @Autowired //应用程序运行时，会自动的查询该类型的bean对象，并赋值给该成员变量
    private ReadingRecordMapper readingRecordMapper;

    /**
     * 创建阅读记录信息
     * @param readingRecord
     */
    public boolean saveReadingRecord(ReadingRecord readingRecord){
        Integer rows=readingRecordMapper.insertReadingRecord(readingRecord);
        return rows == 1;
    }
    /**
     * 根据书籍id和用户id查询阅读记录
     * @param userId
     * @param bookId
     * @return
     */
    public ReadingRecord findByUserIdAndBookId(int userId,int bookId){
        return readingRecordMapper.findByUserIdAndBookId(userId,bookId);
    }
}
