package web.sn.dream.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import web.sn.dream.pojo.MyToDo;
import web.sn.dream.mapper.MyToDoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import web.sn.dream.pojo.Result;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
    @PostMapping("/addToDo")
    public Result addToDo(String info,String title,int userId,String endTime,String category,int level){
        // 定义输入格式（解析时使用）
        DateTimeFormatter inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        // 定义输出格式（转换后使用）
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        // 转换过程
        LocalDateTime dateTime = LocalDateTime.parse(endTime, inputFormatter);
        String convertedDateTime = dateTime.format(outputFormatter);
        MyToDo myToDo = new MyToDo();
        myToDo.setInfo(info);
        myToDo.setUserId(userId);
        myToDo.setTitle(title);
        myToDo.setIfFinish(Boolean.FALSE);
        myToDo.setCtime(new Date());
        Date nowEndTime = null;
        try {
            nowEndTime = sdf.parse(convertedDateTime);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        myToDo.setEndTime(nowEndTime);
        myToDo.setCategory(category);
        myToDo.setLevel(level);
        myToDoMapper.insertMyToDo(myToDo);
        log.info("添加成功");
        //data 用于当前账户的信息处理
        return Result.success(myToDo);
    }
    @GetMapping("/searchMyToDo")
    public Result searchMyToDo(int userId,String currentFilter,String currentSort){
        List<MyToDo> list_myToDo ;
        // 调用业务对象的方法执行登录，并获取返回值
        list_myToDo= myToDoMapper.findMyToDoByUserIdAndFilterAndSort(userId,currentFilter,currentSort);
        //data 用于当前账户的信息处理
        return Result.success(list_myToDo);
    }


    @PostMapping("/updateToDo")
    public Result updateToDo(String info,int myToDoId,String title,int level,String category,String endTime,boolean ifFinish) {
        MyToDo myToDo = myToDoMapper.findMyToDoById(myToDoId);
        // 定义输入格式（解析时使用）
        DateTimeFormatter inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        // 定义输出格式（转换后使用）
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        // 转换过程
        LocalDateTime dateTime = LocalDateTime.parse(endTime, inputFormatter);
        String convertedDateTime = dateTime.format(outputFormatter);
        myToDo.setInfo(info);
        myToDo.setTitle(title);
        myToDo.setIfFinish(ifFinish);
        myToDo.setCtime(new Date());
        Date nowEndTime = null;
        try {
            nowEndTime = sdf.parse(convertedDateTime);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        myToDo.setLevel(level);
        myToDo.setCategory(category);
        myToDo.setEndTime(nowEndTime);
        myToDoMapper.updateMyToDo(myToDo);
        log.info("更新成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }

    @PostMapping("/deleteToDo")
    public Result deleteToDo(int myToDoId) {
        myToDoMapper.deleteMyToDoById(myToDoId);
        log.info("删除成功");
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

        myToDoMapper.updateMyToDo(myToDo);
        log.info("移除成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }

    @RequestMapping ("/getToDoList")
    public Result getToDoList(int userId,boolean ifShow){
        List<MyToDo> list_myToDo ;
        // 调用业务对象的方法执行登录，并获取返回值
        list_myToDo= myToDoMapper.findMyToDoByUserId(userId,ifShow);
        //data 用于当前账户的信息处理
        return Result.success(list_myToDo);
    }

}
