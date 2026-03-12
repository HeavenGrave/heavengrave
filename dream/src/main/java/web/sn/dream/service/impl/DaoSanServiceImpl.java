package web.sn.dream.service.impl;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.DaoSanMapper;
import web.sn.dream.pojo.DaoSan;
import web.sn.dream.service.DaoSanService;

import java.util.List;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class DaoSanServiceImpl implements DaoSanService {

    @Autowired
    private  DaoSanMapper DaoSanMapper;

    /**
     * 创建一场麻将游戏
     * @param daoSan
     */
    public boolean insertDaoSan (DaoSan daoSan) {
        Integer rows=DaoSanMapper.insertDaoSan(daoSan);
        return rows == 1;
    }

    /**
     * 清除所有数据
     */
    public void deleteAllData(){
        DaoSanMapper.deleteAllData();
    }

    @Override
    public DaoSan findDaoSanById(String roomId) {
       return DaoSanMapper.findDaoSanById(roomId);
    }

    @Override
    public boolean updateDaoSan(DaoSan DaoSan) {
        Integer rows=DaoSanMapper.updateDaoSan(DaoSan);
        return rows == 1;
    }

    @Override
    public List<DaoSan> findRoomInfoByStatus(int status){
        return DaoSanMapper.findRoomInfoByStatus(status);
    }

    @Override
    public boolean updateDaoSanByCreateId(DaoSan DaoSan){
        return DaoSanMapper.updateDaoSanByCreateId(DaoSan);
    }

    @Override
    public void deleteOutTimeDaoSan(){
        DaoSanMapper.deleteOutTimeDaoSan();
    }
}
