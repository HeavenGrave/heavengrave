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
    private String title;//标题
    private String info;//信息
    private Date ctime;//创建时间
    private Date endTime;//截至时间
    private Boolean ifFinish;//是否完成
    private String category;//任务类型
    private Integer level;//任务等级
}
