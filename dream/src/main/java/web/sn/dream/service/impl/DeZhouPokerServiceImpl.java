package web.sn.dream.service.impl;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.DeZhouPokerMapper;
import web.sn.dream.mapper.MaJiangMapper;
import web.sn.dream.pojo.DeZhouPoker;
import web.sn.dream.pojo.MaJiang;
import web.sn.dream.service.DeZhouPokerService;
import web.sn.dream.service.MaJiangService;

import java.util.List;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class DeZhouPokerServiceImpl implements DeZhouPokerService {

    @Autowired
    private DeZhouPokerMapper deZhouPokerMapper;

    /**
     * 创建一场德州扑克游戏
     * @param deZhouPoker
     */
    public boolean insertDeZhouPoker (DeZhouPoker deZhouPoker) {
        Integer rows=deZhouPokerMapper.insertDeZhouPoker(deZhouPoker);
        return rows == 1;
    }

    /**
     * 清除所有数据
     */
    public void deleteAllData(){
        deZhouPokerMapper.deleteAllData();
    }

    @Override
    public DeZhouPoker findDeZhouPokerById(String roomId) {
       return deZhouPokerMapper.findDeZhouPokerById(roomId);
    }

    @Override
    public boolean updateDeZhouPoker(DeZhouPoker deZhouPoker) {
        Integer rows=deZhouPokerMapper.updateDeZhouPoker(deZhouPoker);
        return rows == 1;
    }

    @Override
    public List<DeZhouPoker> findRoomInfoByStatus(int status){
        return deZhouPokerMapper.findRoomInfoByStatus(status);
    }

    @Override
    public boolean updateDeZhouPokerByCreateId(DeZhouPoker deZhouPoker){
        return deZhouPokerMapper.updateDeZhouPokerByCreateId(deZhouPoker);
    }

//    @Override
//    public void deleteOutTimeMaJiang(){
//        deZhouPokerMapper.deleteOutTimeDeZhouPoker();
//    }
}
