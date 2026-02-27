package web.sn.dream.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyTab {
    private Integer id;
    private String name;
    private String info;
    private String color;
    private String url;
    private Integer userId;
    private String type;
    private String iconType;
    private String iconUrl;
    private Integer index;
}
