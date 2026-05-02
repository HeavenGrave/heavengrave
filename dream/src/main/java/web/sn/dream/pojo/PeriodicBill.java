package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 周期账单
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeriodicBill {
    private Integer id;
    private String name;// 名称
    private String type;// 类型 1 收入 2 支出
    private double amount;//金额
    private String accountName; // 账户名称
    private String accountId;// 账户id
    private String tallyBookId;// 账本id
}
