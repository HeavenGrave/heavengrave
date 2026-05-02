package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.TallyBookMapper;
import web.sn.dream.pojo.TallyBook;
import web.sn.dream.service.TallyBookService;

import java.util.List;

@Slf4j
@Service
public class  TallyBookServiceimpl implements TallyBookService {
    @Autowired
    private TallyBookMapper tallyBookMapper;


    @Override
    public Integer insertTallyBook(TallyBook tallyBook) {
        return tallyBookMapper.insertTallyBook(tallyBook);
    }

    @Override
    public void updateTallyBook(TallyBook tallyBook) {
        tallyBookMapper.updateTallyBook(tallyBook);
    }

    @Override
    public TallyBook findTallyBookByUserId(int userId) {
        return tallyBookMapper.findTallyBookByUserId(userId);
    }

    @Override
    public TallyBook findTallyBookById(int id) {
        return tallyBookMapper.findTallyBookById( id);
    }

    @Override
    public void deleteTallyBookById(int id) {
        tallyBookMapper.deleteTallyBookById(id);
    }

    @Override
    public List<TallyBook> findAllTallyBook() {
        return tallyBookMapper.findAllTallyBook();
    }

    @Override
    public List<TallyBook> findTallyBookByCond(String name, String type, int userId) {
        return tallyBookMapper.findTallyBookByCond(name, type, userId);
    }
}
