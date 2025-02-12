package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyToDo {
    private Integer id;//id
    private Integer userId;//用户id
    private String info;//信息
    private Date ctime;//时间
    private Boolean ifFinish;//是否完成
    private Boolean ifShow;//是否展示
    private Date toDay;//对应日期
}
