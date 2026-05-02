package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.PeriodicBillMapper;
import web.sn.dream.mapper.PeriodicBillMapper;
import web.sn.dream.pojo.PeriodicBill;
import web.sn.dream.service.PeriodicBillService;

import java.util.List;

@Slf4j
@Service
public class PeriodicBillServiceImpl implements PeriodicBillService {
    @Autowired
    private PeriodicBillMapper periodicBillMapper;


    @Override
    public Integer insertPeriodicBill(PeriodicBill periodicBill) {
        return periodicBillMapper.insertPeriodicBill(periodicBill);
    }

    @Override
    public void updatePeriodicBill(PeriodicBill periodicBill) {
        periodicBillMapper.updatePeriodicBill(periodicBill);
    }

    @Override
    public List<PeriodicBill> findPeriodicBillsByTallyBookId(int tallyBookId) {
        return periodicBillMapper.findPeriodicBillsByTallyBookId(tallyBookId);
    }

    @Override
    public void deletePeriodicBillById(int id) {
        periodicBillMapper.deletePeriodicBillById( id);
    }

    @Override
    public List<PeriodicBill> findAllPeriodicBill() {
        return periodicBillMapper.findAllPeriodicBill();
    }

    @Override
    public List<PeriodicBill> findPeriodicBillByCond(String name, String type, int userId) {
        return periodicBillMapper.findPeriodicBillByCond(name, type, userId);
    }
}
