package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.Renovation;

import java.util.List;

@Mapper
public interface RenovationMapper {
    //增删改查
    Integer insertRenovation(Renovation renovation);
    void  updateRenovation(Renovation renovation);
    Renovation  findRenovationById(int id);
    void deleteRenovationById(int id);
    List<Renovation> findAllRenovation();
    List<Renovation> findRenovationByCond(String brand, String cond, String timeSort,String status);
    List<String> getBrandList();
}
