package web.sn.dream.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import web.sn.dream.pojo.MyToDo;
import web.sn.dream.mapper.MyToDoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import web.sn.dream.pojo.Result;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("todo")
public class MyToDoController {
    @Autowired
    private MyToDoMapper myToDoMapper;
    //时间格式化工具
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    @PostMapping("/addToDo")
    public Result addToDo(String info, int userId, String toDay){
        MyToDo myToDo = new MyToDo();
        myToDo.setInfo(info);
        myToDo.setUserId(userId);
        myToDo.setIfFinish(Boolean.FALSE);
        myToDo.setIfShow(Boolean.TRUE);
        myToDo.setCtime(new Date());
        String toDayStr =toDay+" 00:00:01";
        try {
            myToDo.setToDay(sdf.parse(toDayStr));
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        myToDoMapper.insertMyToDo(myToDo);
        log.info("添加成功");
        //data 用于当前账户的信息处理
        return Result.success(myToDo);
    }
    @GetMapping("/showMyToDo")
    public Result showMyToDo(int userId,boolean ifShow,String startDay,String endDay){
        Date startDate = null;
        Date endDate = null;
        try {
            if(startDay!=null&&!"".equals(startDay)) {
                startDate = sdf.parse(startDay + " 00:00:00");
            }
            if(endDay!=null&&!"".equals(endDay)){
                endDate = sdf.parse(endDay + " 23:59:59");
            }
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        List<MyToDo> list_myToDo ;
        // 调用业务对象的方法执行登录，并获取返回值
        if(startDate==null&&endDate==null){
            list_myToDo= myToDoMapper.findMyToDoByUserId(userId,ifShow);
        }else{
            list_myToDo= myToDoMapper.findMyToDoBysTOeTimeAndUserId(startDate,endDate,userId,ifShow);
        }
        //data 用于当前账户的信息处理
        return Result.success(list_myToDo);
    }


    @PutMapping("/updateToDo")
    public Result updateToDo(String info,int myToDoId) {
        MyToDo myToDo = myToDoMapper.findMyToDoById(myToDoId);
        myToDo.setInfo(info);
        myToDoMapper.updateMyToDo(myToDo);
        log.info("更新成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }


    @RequestMapping ("/updateToDoStatus")
    public Result updateToDoStatus(int myToDoId,boolean ifFinish) {
        MyToDo myToDo = myToDoMapper.findMyToDoById(myToDoId);
        myToDo.setIfFinish(ifFinish);
        myToDoMapper.updateMyToDo(myToDo);
        log.info("更新成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }

    @RequestMapping ("/updateToDoIfShow")
    public Result updateToDoIfShow(int myToDoId,boolean ifShow) {
//        myToDoMapper.deleteMyToDoById(myToDoId);
        MyToDo myToDo = myToDoMapper.findMyToDoById(myToDoId);
        myToDo.setIfShow(ifShow);
        myToDoMapper.updateMyToDo(myToDo);
        log.info("移除成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }
}
