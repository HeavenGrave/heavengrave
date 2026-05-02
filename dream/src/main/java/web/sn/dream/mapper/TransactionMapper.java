package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.Transaction;

import java.util.List;

@Mapper
public interface TransactionMapper {
    Integer insertTransaction(Transaction transaction);
    void updateTransaction(Transaction transaction);
    List<Transaction> findTransactionByTallyBookId(int tallyBookId);
    void deleteTransactionById(int id);
    List<Transaction> findAllTransaction();
    List<Transaction> findTransactionsByCond(int tallyBookId,String type,String classified,String account,String startTime,String endTime);
}
