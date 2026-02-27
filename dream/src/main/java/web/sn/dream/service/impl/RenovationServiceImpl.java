package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.RenovationMapper;
import web.sn.dream.pojo.Renovation;
import web.sn.dream.service.RenovationService;

import java.util.List;

@Slf4j
@Service
public class RenovationServiceImpl implements RenovationService {
    @Autowired
    private RenovationMapper renovationMapper;
    @Override
    public void updateRenovation(Renovation renovation) {
        renovationMapper.updateRenovation(renovation);
    }
    @Override
    public void deleteRenovationById(int id) {
        renovationMapper.deleteRenovationById(id);
    }

    @Override
    public Integer insertRenovation(Renovation renovation) {
        return renovationMapper.insertRenovation(renovation);
    }
    @Override
    public Renovation findRenovationById(int id) {
        return renovationMapper.findRenovationById(id);
    }

    @Override
    public List<Renovation> findRenovationByCond(String brand, String cond, String timeSort,String status) {
        return renovationMapper.findRenovationByCond(brand,cond,timeSort,status);
    }

    @Override
    public List<Renovation> findAllRenovation() {
        return renovationMapper.findAllRenovation();
    }
    @Override
    public List<String> getBrandList() {
      return renovationMapper.getBrandList();
    }
}
