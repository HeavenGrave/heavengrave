package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.MyTab;
import web.sn.dream.pojo.MyTab;

import java.util.Date;
import java.util.List;

@Mapper
public interface MyTabMapper {
    Integer insertMyTab(MyTab myTab);

    List<MyTab> findMyTabByUserId(Date time_s, Date time_e,int userId,boolean ifShow);

    void  updateMyTab(MyTab MyTab);

    MyTab findMyTabById(int id);

    void deleteMyTabById(int id);

    List<MyTab> findAllMyTab();

    List<MyTab> findMyTabByUserIdAndType(int userId, String type);
}
