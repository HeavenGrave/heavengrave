package web.sn.dream.mapper;

import web.sn.dream.pojo.MyEdit;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MyEditMapper {
    Integer insertMyEdit(MyEdit myEdit);

    List<MyEdit> findMyEditByUserId(int UserId);

    void  updateMyEdit(MyEdit DyEdit);

    MyEdit  findMyEditById(int id);

    void deleteMyEditById(int id);

    List<MyEdit> findAllEdit();
}
