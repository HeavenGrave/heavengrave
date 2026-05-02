package web.sn.dream.service;

import org.springframework.stereotype.Service;
import web.sn.dream.pojo.PeriodicBill;
import web.sn.dream.pojo.TallyBook;

import java.util.List;

@Service
public interface PeriodicBillService {
    Integer insertPeriodicBill(PeriodicBill periodicBill);
    void updatePeriodicBill(PeriodicBill periodicBill);
    List<PeriodicBill> findPeriodicBillsByTallyBookId(int tallyBookId);
    void deletePeriodicBillById(int id);
    List<PeriodicBill> findAllPeriodicBill();
    List<PeriodicBill> findPeriodicBillByCond(String name, String type, int userId);
}
