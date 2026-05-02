package web.sn.dream.service;

import org.springframework.stereotype.Service;
import web.sn.dream.pojo.PeriodicBill;
import web.sn.dream.pojo.TallyBook;

import java.util.List;

@Service
public interface TallyBookService {
    Integer insertTallyBook(TallyBook tallyBook);
    void updateTallyBook(TallyBook tallyBook);
    TallyBook findTallyBookByUserId(int userId);
    TallyBook findTallyBookById(int id);
    void deleteTallyBookById(int id);
    List<TallyBook> findAllTallyBook();
    List<TallyBook> findTallyBookByCond(String name, String type, int userId);
}
