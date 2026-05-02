package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;

/**
 * 交易记录
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private Integer id;//id
    private String type;//交易类型  income收入  expend支出 花费
    private String classified;//交易分类
    private String account;//账户
    private double amount;//金额
    private String des;//描述
    private double budget;// 预算
    private double target;// 目标
    private Date createTime;//创建时间
    private Integer tallyBookId;// 账本id
}
