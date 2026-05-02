package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.Account;

import java.util.List;

@Mapper
public interface AccountMapper {
    Integer insertAccount(Account account);
    void updateAccount(Account account);
    List<Account> findAccountByTallyBookId(int tallyBookId);
    void deleteAccountById(int id);
    List<Account> findAccountByCond(String name, String type,int tallyBookId);
}
