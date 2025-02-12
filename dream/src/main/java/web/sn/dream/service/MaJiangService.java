package web.sn.dream.service;

import web.sn.dream.pojo.MaJiang;

public interface MaJiangService {
    boolean insertMaJiang (MaJiang maJiang);

    void deleteAllData();

    MaJiang findMaJiangById(String roomId);

    boolean updateMaJiang(MaJiang maJiang);
}
