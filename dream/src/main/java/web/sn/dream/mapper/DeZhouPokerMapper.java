package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.DeZhouPoker;

import java.util.List;

@Mapper
public interface DeZhouPokerMapper {
    Integer insertDeZhouPoker (DeZhouPoker deZhouPoker);

    void deleteAllData();

    Integer updateDeZhouPoker (DeZhouPoker DeZhouPoker);

    DeZhouPoker findDeZhouPokerById(String id);

    List<DeZhouPoker> findRoomInfoByStatus(int status);

    boolean updateDeZhouPokerByCreateId(DeZhouPoker DeZhouPoker);

    void deleteOutTimeDeZhouPoker();
}
