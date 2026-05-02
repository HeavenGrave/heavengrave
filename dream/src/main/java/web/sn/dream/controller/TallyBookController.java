package web.sn.dream.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web.sn.dream.pojo.*;
import web.sn.dream.service.AccountService;
import web.sn.dream.service.PeriodicBillService;
import web.sn.dream.service.TallyBookService;
import web.sn.dream.service.TransactionService;

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

    /*@PostMapping("/addMyTab")
    public Result addMyTab(int userId, String name, String color, String info, String url, String type, String iconType, String iconUrl){

    }*/
    @GetMapping("/searchTallyBook")
    public Result searchTallyBookByUserId(int userId){
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


}
