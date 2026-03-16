package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * @author Stan
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DaoSan {
    private String id;//当前对局的id
    private String createUserId;//房主id
    private String createUserName;//房主名称
    private String player1;//玩家1名称
    private String player2;//玩家2名称
    private String player3;//玩家3名称
    private String player4;//玩家4名称
    private String player5;//玩家5名称
    private Integer playerNum;//当前玩家数
    private Integer status;//游戏状态 0游戏结束 1准备中 2游戏中
    private Date createTime;//创建时间
}
