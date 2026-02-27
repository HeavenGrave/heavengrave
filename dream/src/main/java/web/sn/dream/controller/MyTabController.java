package web.sn.dream.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web.sn.dream.mapper.MyTabMapper;
import web.sn.dream.pojo.MyTab;
import web.sn.dream.pojo.MyToDo;
import web.sn.dream.pojo.Result;
import web.sn.dream.service.MyTabService;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("myTab")
public class MyTabController {
    @Autowired
    private MyTabService myTabService;

    @PostMapping("/addMyTab")
    public Result addMyTab(int userId,String name,String color,String info,String url,String type,String iconType,String iconUrl){
        MyTab myTab = new MyTab();
        myTab.setInfo(info);
        myTab.setUserId(userId);
        myTab.setName(name);
        myTab.setColor(color);
        myTab.setUrl(url);
        myTab.setType(type);
        myTab.setIconType(iconType);
        myTab.setIconUrl(iconUrl);
        myTabService.insertMyTab(myTab);
        log.info("添加成功");
        //data 用于当前账户的信息处理
        return Result.success(myTab);
    }
    @GetMapping("/searchMyTab")
    public Result searchMyTab(int userId,String type){
        List<MyTab> list_myTab ;
        // 调用业务对象的方法执行登录，并获取返回值
        list_myTab= myTabService.findMyTabByUserIdAndType(userId, type);
        //data 用于当前账户的信息处理
        return Result.success(list_myTab);
    }

    @PostMapping("/updateMyTab")
    public Result updateMyTab(int id,String name,String color,String info,String url,String iconType,String iconUrl) {
        MyTab myTab = myTabService.findMyTabById(id);
        myTab.setName(name);
        myTab.setInfo(info);
        myTab.setColor(color);
        myTab.setUrl(url);
        myTab.setIconType(iconType);
        myTab.setIconUrl(iconUrl);
        myTabService.updateMyTab(myTab);
        log.info("更新成功");
        //data 用于当前账户的信息处理
        return Result.success(myTab);
    }

    @PostMapping("/deleteMyTab")
    public Result deleteMyTab(int id) {
        myTabService.deleteMyTabById(id);
        log.info("删除成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }

    @GetMapping ("/getMyTabById")
    public Result getMyTabById(int id){
        // 调用业务对象的方法执行登录，并获取返回值
        MyTab myTab= myTabService.findMyTabById(id);
        //data 用于当前账户的信息处理
        return Result.success(myTab);
    }

}
