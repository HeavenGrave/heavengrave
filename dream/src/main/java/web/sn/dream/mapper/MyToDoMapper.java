package web.sn.dream.mapper;

import web.sn.dream.pojo.MyToDo;
import org.apache.ibatis.annotations.Mapper;

import java.util.Date;
import java.util.List;

@Mapper
public interface MyToDoMapper {
    Integer insertMyToDo(MyToDo myToDo);

    List<MyToDo> findMyToDoBysTOeTimeAndUserId(Date time_s, Date time_e,int userId,boolean ifShow);

    List<MyToDo> findMyToDoByUserId(int userId,boolean ifShow);

    void  updateMyToDo(MyToDo myToDo);

    MyToDo findMyToDoById(int id);

    void deleteMyToDoById(int id);

    List<MyToDo> findAllToDo();
}
