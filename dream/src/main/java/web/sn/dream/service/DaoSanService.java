package web.sn.dream.service;

import web.sn.dream.pojo.DaoSan;

import java.util.List;


public interface DaoSanService {
    boolean insertDaoSan (DaoSan daoSan);

    void deleteAllData();

    DaoSan findDaoSanById(String roomId);

    boolean updateDaoSan(DaoSan DaoSan);

    List<DaoSan> findRoomInfoByStatus(int status);

    boolean updateDaoSanByCreateId(DaoSan daoSan);

    void deleteOutTimeDaoSan();
}
