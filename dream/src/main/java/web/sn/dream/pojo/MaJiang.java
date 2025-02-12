package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaJiang {
    private String id;//当前对局idF
    private String createUserId;//房主id
    private String createUserName;//房主名称
    private String player1;//玩家1id
    private String player2;//玩家2id
    private String player3;//玩家3id
    private String player4;//玩家4id
    private Integer playerNum;//当前玩家数量
    private Integer nowNum;//当前桌需要的玩家数量
}
