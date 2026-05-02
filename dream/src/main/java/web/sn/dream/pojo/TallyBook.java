package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 记账本
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TallyBook {
    private Integer id;//id
    private String name;//名称
    private String type;// 类型
    private double amount;// 金额
    private double budget;// 预算
    private double target;// 目标
    private Integer userId;// 用户id
}
