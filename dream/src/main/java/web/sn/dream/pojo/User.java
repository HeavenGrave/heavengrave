package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;//用户id
    private String name;//用户名称
    private String password;//用户密码
    private String salt;//密码加密盐值
    private String signature;//个性签名
    private String type;//角色类型  管理员  普通用户  vip用户等
    private Integer score;//用户积分
    private String image;//头像
}
