package web.sn.dream.service;

import web.sn.dream.pojo.DeZhouPoker;
import web.sn.dream.pojo.MaJiang;

import java.util.List;


public interface DeZhouPokerService {
    boolean insertDeZhouPoker (DeZhouPoker deZhouPoker);

    void deleteAllData();

    DeZhouPoker findDeZhouPokerById(String roomId);

    boolean updateDeZhouPoker(DeZhouPoker deZhouPoker);

    List<DeZhouPoker> findRoomInfoByStatus(int status);

    boolean updateDeZhouPokerByCreateId(DeZhouPoker deZhouPoker);
 
}
