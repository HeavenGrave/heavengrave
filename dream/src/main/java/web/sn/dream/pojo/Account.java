package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 资金账户
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    private Integer id;//id
    private String name;//名称
    private String type;// 类型
    private double amount;// 金额
    private String tallyBookId;// 账本id
}
