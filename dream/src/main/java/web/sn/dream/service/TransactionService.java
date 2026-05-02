package web.sn.dream.service;

import org.springframework.stereotype.Service;
import web.sn.dream.pojo.Transaction;

import java.util.List;

@Service
public interface TransactionService {
    Integer insertTransaction(Transaction transaction);
    void updateTransaction(Transaction transaction);
    List<Transaction> findTransactionByTallyBookId(int tallyBookId);
    void deleteTransactionById(int id);
    List<Transaction> findAllTransaction();
    List<Transaction> findTransactionsByCond(int tallyBookId,String type,String classified,String account,String startTime,String endTime);
}
