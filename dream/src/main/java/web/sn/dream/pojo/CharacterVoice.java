package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharacterVoice {
    private int id;
    private String book;//书名
    private String actor;//角色
    private String gender;//性别
    private String voice;//声音code
    private String tone;//音调
    private double speechRate;//语速
    private String volume;//音量
    private String emotion;//情感
    private String text;//文本
    private String url;//音频地址
    private Date createTime;//创建时间
    private Date updateTime;//修改时间
}
