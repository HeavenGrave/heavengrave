package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.AccountMapper;
import web.sn.dream.pojo.Account;
import web.sn.dream.service.AccountService;

import java.util.List;

@Slf4j
@Service
public class AccountServiceImpl implements AccountService {
    @Autowired
    private AccountMapper accountMapper;


    @Override
    public Integer insertAccount(Account account) {
        return accountMapper.insertAccount( account);
    }

    @Override
    public void updateAccount(Account account) {
        accountMapper.updateAccount( account);
    }

    @Override
    public List<Account> findAccountByTallyBookId(int tallyBookId) {
        return accountMapper.findAccountByTallyBookId(tallyBookId);
    }
}
