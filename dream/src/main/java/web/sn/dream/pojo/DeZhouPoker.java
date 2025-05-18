package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeZhouPoker {
    private String id;//当前对局id
    private String createUserId;//房主id
    private String createUserName;//房主名称
    private String player1;//玩家1名称
    private String player2;//玩家2名称
    private String player3;//玩家3名称
    private String player4;//玩家4名称
    private String player5;//玩家5名称
    private String player6;//玩家6名称
    private String player7;//玩家7名称
    private String player8;//玩家8名称
    private String player9;//玩家9名称
    private String player10;//玩家10名称
    private Integer playerNum;//当前玩家数量
    private Integer status;//游戏状态  0：已结束 1：准备中 2：游戏中
    private Integer dealer;//当前的庄家
    private Integer price;//资产
    private Date createTime;//创建时间
}
