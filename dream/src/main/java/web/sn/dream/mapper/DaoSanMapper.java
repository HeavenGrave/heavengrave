package web.sn.dream.mapper;


import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.DaoSan;
import web.sn.dream.pojo.MaJiang;

import java.util.List;

@Mapper //应用程序在运行时会自动的为该接口生成一个实现类（代理对象），并且会自动将该实现对象放入ioc容器中，成为IOC容器管理的bean
public interface DaoSanMapper {
    Integer insertDaoSan (DaoSan daoSan);

    void deleteAllData();

    Integer updateDaoSan (DaoSan daoSan);

    DaoSan findDaoSanById(String id);

    List<DaoSan> findRoomInfoByStatus(int status);

    boolean updateDaoSanByCreateId(DaoSan daoSan);

    void deleteOutTimeDaoSan();
}
