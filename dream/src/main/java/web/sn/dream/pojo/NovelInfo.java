package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NovelInfo {
    private Integer id;// 小说id
    private String content;// 本句内容
    private Integer chapterNum; // 章节数
    private Integer index;// 索引
    private String actorVoice;// 角色音
    private String actorName;// 角色名
    private String novelName;// 小说名
    private String novelVoiceUrl;// 本句语音
    private String emotion; // 情绪
    private String tone; // 音调
    private Double speechRate; // 语速
    private String volume; // 音量
}
