package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.TransactionMapper;
import web.sn.dream.pojo.Transaction;
import web.sn.dream.service.TransactionService;

import java.util.List;

@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {
    @Autowired
    private TransactionMapper transactionMapper;

    @Override
    public Integer insertTransaction(Transaction transaction) {
        return transactionMapper.insertTransaction(transaction);
    }

    @Override
    public void updateTransaction(Transaction transaction) {
        transactionMapper.updateTransaction( transaction);
    }

    @Override
    public List<Transaction> findTransactionByTallyBookId(int tallyBookId) {
        return transactionMapper.findTransactionByTallyBookId(tallyBookId);
    }

    @Override
    public void deleteTransactionById(int id) {
        transactionMapper.deleteTransactionById(id);
    }

    @Override
    public List<Transaction> findAllTransaction() {
        return transactionMapper.findAllTransaction();
    }

    @Override
    public List<Transaction> findTransactionsByCond(int tallyBookId, String type, String classified, String account, String startTime, String endTime) {
        return transactionMapper.findTransactionsByCond(tallyBookId, type, classified, account, startTime, endTime);
    }


}
