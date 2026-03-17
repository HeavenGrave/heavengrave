package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardDaoSan {
    private Integer id;
    private String decor;   //花色
    private String number;  //名称
    private Integer size;   //数字
    private Integer priority; //优先级
}
