package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaJiang {
    private String id;//当前对局idF
    private String createUserId;//房主id
    private String createUserName;//房主名称
    private String player1;//玩家1名称
    private String player2;//玩家2名称
    private String player3;//玩家3名称
    private String player4;//玩家4名称
    private Integer playerNum;//当前玩家数量
    private Integer nowNum;//当前桌需要的玩家数量
    private Integer status;//游戏状态
    private String gamePlay;//游戏玩法
    private Integer quan;//圈数
    private String dealType;//坐庄类型
    private Integer dealer;//当前的庄家
    private Integer price;//资产
    private Date createTime;//创建时间
}
