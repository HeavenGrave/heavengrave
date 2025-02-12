package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 麻将牌基础类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardMaJiang {
    private String id;
    private String decor;   //花色  万 条 筒 风
    private String name;  //名称
    private Integer size;   //数字
    private Integer lenght; //优先级
}
