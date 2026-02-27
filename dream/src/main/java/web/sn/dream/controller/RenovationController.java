package web.sn.dream.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web.sn.dream.pojo.Renovation;
import web.sn.dream.pojo.Result;
import web.sn.dream.service.RenovationService;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/renovation")
public class RenovationController {
    @Autowired
    private RenovationService renovationService;
    //时间格式化工具
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
    @RequestMapping("/addRenovation")
    public Result addRenovation(String category, String brand, String model, String specifications, double price,int  quantity,String remark, String time, String unit, String totalPrice,String status){
        Renovation renovation = new Renovation();
        renovation.setCategory(category);
        renovation.setUnit(unit);
        renovation.setQuantity(quantity);
        renovation.setTotalPrice(totalPrice);
        renovation.setUnit(unit);
        renovation.setBrand(brand);
        renovation.setModel(model);
        renovation.setSpecifications(specifications);
        renovation.setPrice(price);
        renovation.setRemark(remark);
        renovation.setStatus(status);
        Date nowTime = null;
        try {
            nowTime = sdf.parse(time+" 08:00");
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        renovation.setTime(nowTime);
        renovationService.insertRenovation(renovation);
        log.info("添加成功");
        //data 用于当前账户的信息处理
        return Result.success(renovation);
    }

    @RequestMapping("/updateRenovation")
    public Result updateRenovation(int id,String category, String brand, String model, String specifications,Double price, String remark, String time, String unit, String totalPrice,Integer quantity,String status){
        Renovation renovation = renovationService.findRenovationById(id);
        renovation.setCategory(category);
        renovation.setBrand(brand);
        renovation.setModel(model);
        renovation.setSpecifications(specifications);
        renovation.setPrice(price);
        renovation.setUnit(unit);
        renovation.setQuantity(quantity);
        renovation.setTotalPrice(totalPrice);
        renovation.setRemark(remark);
        renovation.setStatus(status);
        Date nowTime = null;
        try {
            nowTime = sdf.parse(time+" 08:00");
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        renovation.setTime(nowTime);
        renovationService.updateRenovation(renovation);
        log.info("更新成功");
        return Result.success("更新成功");
    }

    @RequestMapping("/deleteRenovation")
    public Result deleteRenovation(int id){
        renovationService.deleteRenovationById(id);
        log.info("删除成功");
        return Result.success();
    }
    @RequestMapping("/findRenovationById")
    public Result findRenovationById(int id){
        Renovation renovation = renovationService.findRenovationById(id);
        log.info("查询成功");
        return Result.success(renovation);
    }

    @RequestMapping("/searchRenovation")
    public Result searchRenovation(String brand,String cond,String timeSort,String status){
        log.info("开始查询");
        String brand_ = null;
        String cond_ = null;
        String status_ = null;
        if (!"".equals(brand)&&!"null".equals(brand)){
            brand_ = brand;
        }
        if (!"".equals(cond)&&!"null".equals(cond)){
            cond_ = cond;
        }
        if (!"".equals(status)&&!"null".equals(status)&&!"all".equals(status)){
            status_ = status;
        }
        List<Renovation> list_renovation = renovationService.findRenovationByCond(brand_,cond_,timeSort,status_);
        log.info("查询成功");
        return Result.success(list_renovation);
    }
    @RequestMapping("/findAllRenovation")
    public Result findAllRenovation(){
        List<Renovation> list_renovation = renovationService.findAllRenovation();
        log.info("查询成功");
        return Result.success(list_renovation);
    }

    @RequestMapping("/getBrandList")
    public Result getBrandList(){
        List<String> list_brand = renovationService.getBrandList();
        log.info("查询成功");
        return Result.success(list_brand);
    }


}
