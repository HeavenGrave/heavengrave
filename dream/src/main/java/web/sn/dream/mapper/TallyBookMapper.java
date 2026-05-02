package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.TallyBook;

import java.util.List;

@Mapper
public interface TallyBookMapper {
    Integer insertTallyBook(TallyBook tallyBook);
    void updateTallyBook(TallyBook tallyBook);
    TallyBook findTallyBookByUserId(int userId);
    void deleteTallyBookById(int id);
    List<TallyBook> findAllTallyBook();
    List<TallyBook> findTallyBookByCond(String name, String type,int userId);
    TallyBook findTallyBookById(int id);
}
