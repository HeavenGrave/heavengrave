package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyEdit {
    private Integer id;//id
    private String title;//标题
    private String info;//信息
    private Date ctime;//时间
    private Integer userId;//用户id
}
