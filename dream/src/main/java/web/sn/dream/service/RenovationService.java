package web.sn.dream.service;

import web.sn.dream.pojo.Renovation;

import java.util.List;

public interface RenovationService {
    Integer insertRenovation(Renovation renovation);
    void  updateRenovation(Renovation renovation);
    Renovation  findRenovationById(int id);
    void deleteRenovationById(int id);
    List<Renovation> findRenovationByCond(String brand, String cond, String timeSort,String status);
    List<Renovation> findAllRenovation();
    List<String> getBrandList();
}
