package web.sn.dream.service;

import org.springframework.stereotype.Service;
import web.sn.dream.pojo.Account;

import java.util.List;

@Service
public interface AccountService {
    Integer insertAccount(Account account);

    void updateAccount(Account account);

    List<Account> findAccountByTallyBookId(int tallyBookId);
}
