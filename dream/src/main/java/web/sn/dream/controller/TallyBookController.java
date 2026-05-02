package web.sn.dream.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.sn.dream.pojo.*;
import web.sn.dream.service.AccountService;
import web.sn.dream.service.PeriodicBillService;
import web.sn.dream.service.TallyBookService;
import web.sn.dream.service.TransactionService;

import java.sql.Date;
import java.util.List;


@RestController //标识当前类是一个请求处理类
@RequestMapping("tally")
public class TallyBookController {

    @Autowired
    private TallyBookService tallyBookService;
    @Autowired
    private PeriodicBillService periodicBillService;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private AccountService accountService;

    @GetMapping("/searchTallyBook")
    public Result searchTallyBookByUserId(HttpSession session){
        int userId = (int) session.getAttribute("id");
        TallyBook tallyBook ;
        // 调用业务对象的方法执行登录，并获取返回值
        tallyBook= tallyBookService.findTallyBookByUserId(userId);
        if (tallyBook == null){
            tallyBook =new TallyBook();
            tallyBook.setUserId(userId);
            tallyBookService.insertTallyBook(tallyBook);
        }
        //data 用于当前账户的信息处理
        return Result.success(tallyBook);
    }

    @GetMapping("/searchRecurringBills")
    public Result searchRecurringBills(int tallyBookId){
        List<PeriodicBill> periodicBills = periodicBillService.findPeriodicBillsByTallyBookId(tallyBookId);
        return Result.success(periodicBills);
    }

    @GetMapping("/searchTransactions")
    public Result searchTransactions(int tallyBookId,String type,String classified,String account,String startTime,String endTime){
        List<Transaction> transactions = transactionService.findTransactionsByCond(tallyBookId, type,classified, account, startTime, endTime);
        return Result.success(transactions);
    }

    @GetMapping("/searchAccounts")
    public Result searchAccounts(int tallyBookId){
        List<Account> accounts = accountService.findAccountByTallyBookId(tallyBookId);
        return Result.success(accounts);
    }

    @PostMapping("/addAccount")
    public Result addAccount(int tallyBookId, String name, double amount){
        if (name == null || name.trim().isEmpty()) {
            return Result.error("账户名称不能为空");
        }
        Account account = new Account();
        account.setName(name.trim());
        account.setType("normal");
        account.setAmount(amount);
        account.setTallyBookId(String.valueOf(tallyBookId));
        accountService.insertAccount(account);
        return Result.success(account);
    }

    @PostMapping("/addPeriodicBill")
    public Result addPeriodicBill(int tallyBookId, String name, String type,double amount,String accountId){
        if (name == null || name.trim().isEmpty()) {
            return Result.error("周期账单名称不能为空");
        }
        PeriodicBill periodicBill = new PeriodicBill();
        periodicBill.setName(name.trim());
        periodicBill.setType(type);
        periodicBill.setAmount(amount);
        periodicBill.setTallyBookId(String.valueOf(tallyBookId));
        periodicBill.setAccountId(accountId);
        periodicBillService.insertPeriodicBill(periodicBill);
        return Result.success(periodicBill);
    }

    @PostMapping("/changeBudget")
    public Result changeBudget(int tallyBookId, double budget){
        TallyBook tallyBook = tallyBookService.findTallyBookById(tallyBookId);
        tallyBook.setBudget(budget);
        tallyBookService.updateTallyBook(tallyBook);
        return Result.success(tallyBook);
    }

    @DeleteMapping("deleteRecurringBill")
    public Result deleteRecurringBill(int id) {
        periodicBillService.deletePeriodicBillById(id);
        return Result.success();
    }

    @PostMapping("/addTransaction")
    public Result addTransaction(int tallyBookId,String category,String type,double amount,String accountId,String des){
        Transaction transaction = new Transaction();
        transaction.setClassified(category);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setDes(des);
        transaction.setCreateTime(new Date(System.currentTimeMillis()));
        transaction.setAccount(accountId);
        transaction.setTallyBookId(tallyBookId);
        transactionService.insertTransaction(transaction);
        return Result.success(transaction);
    }

    @PostMapping("/updateTarget")
    public Result changeTarget(int tallyBookId, double target){
        TallyBook tallyBook = tallyBookService.findTallyBookById(tallyBookId);
        tallyBook.setTarget(target);
        tallyBookService.updateTallyBook(tallyBook);
        return Result.success(tallyBook);
    }
}
