package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 装修花费基础类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Renovation {
    private Integer id;
    private String category;//品类
    private String brand;// 品牌
    private String model;//型号
    private String specifications;// 规格
    private double price;// 价格
    private String unit;//单位
    private Integer quantity;// 数量
    private String remark;// 备注
    private String totalPrice;//总价
    private Date time;// 时间
    private String status;//状态
}
