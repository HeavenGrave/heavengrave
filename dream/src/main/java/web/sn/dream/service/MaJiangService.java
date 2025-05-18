package web.sn.dream.service;

import web.sn.dream.pojo.MaJiang;
import java.util.List;


public interface MaJiangService {
    boolean insertMaJiang (MaJiang maJiang);

    void deleteAllData();

    MaJiang findMaJiangById(String roomId);

    boolean updateMaJiang(MaJiang maJiang);

    List<MaJiang> findRoomInfoByStatus(int status);

    boolean updateMaJiangByCreateId(MaJiang maJiang);

    void deleteOutTimeMaJiang();
}
