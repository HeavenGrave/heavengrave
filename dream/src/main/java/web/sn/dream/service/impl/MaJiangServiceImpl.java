package web.sn.dream.service.impl;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.MaJiangMapper;
import web.sn.dream.pojo.MaJiang;
import web.sn.dream.pojo.MyEdit;
import web.sn.dream.service.MaJiangService;

import java.util.List;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class MaJiangServiceImpl implements MaJiangService {

    @Autowired
    private  MaJiangMapper maJiangMapper;

    /**
     * 创建一场麻将游戏
     * @param maJiang
     */
    public boolean insertMaJiang (MaJiang maJiang) {
        Integer rows=maJiangMapper.insertMaJiang(maJiang);
        return rows == 1;
    }

    /**
     * 清除所有数据
     */
    public void deleteAllData(){
        maJiangMapper.deleteAllData();
    }

    @Override
    public MaJiang findMaJiangById(String roomId) {
       return maJiangMapper.findMaJiangById(roomId);
    }

    @Override
    public boolean updateMaJiang(MaJiang maJiang) {
        Integer rows=maJiangMapper.updateMaJiang(maJiang);
        return rows == 1;
    }

    @Override
    public List<MaJiang> findRoomInfoByStatus(int status){
        return maJiangMapper.findRoomInfoByStatus(status);
    }

    @Override
    public boolean updateMaJiangByCreateId(MaJiang maJiang){
        return maJiangMapper.updateMaJiangByCreateId(maJiang);
    }

    @Override
    public void deleteOutTimeMaJiang(){
        maJiangMapper.deleteOutTimeMaJiang();
    }
}
