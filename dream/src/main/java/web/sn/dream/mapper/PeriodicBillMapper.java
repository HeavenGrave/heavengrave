package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.PeriodicBill;

import java.util.List;

@Mapper
public interface PeriodicBillMapper {
    Integer insertPeriodicBill(PeriodicBill PeriodicBill);
    void updatePeriodicBill(PeriodicBill PeriodicBill);
    List<PeriodicBill> findPeriodicBillsByTallyBookId(int tallyBookId);
    void deletePeriodicBillById(int id);
    List<PeriodicBill> findAllPeriodicBill();
    List<PeriodicBill> findPeriodicBillByCond(String name, String type,int userId);
}
