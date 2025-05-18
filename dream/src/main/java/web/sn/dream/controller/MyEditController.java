package web.sn.dream.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import web.sn.dream.pojo.MyEdit;
import web.sn.dream.mapper.MyEditMapper;
import web.sn.dream.pojo.Result;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("edit")
public class MyEditController {
    @Autowired
    private MyEditMapper myEditMapper;
    @PostMapping("/addEdit")
    public Result addEdit(MyEdit myEdit){
        myEdit.setCtime(new java.util.Date());
        myEditMapper.insertMyEdit(myEdit);
        log.info("添加成功");
        //data 用于当前账户的信息处理
        return  Result.success();
    }

    @PostMapping("/showMyEdit")
    public Result showMyEdit(Integer userId){
        // 调用业务对象的方法执行登录，并获取返回值
        List<MyEdit> list_myEdit= myEditMapper.findMyEditByUserId(userId);
        //data 用于当前账户的信息处理
        return Result.success(list_myEdit);
    }

    @PostMapping("/showAllEdit")
    public Result showAllEdit(){
        List<MyEdit> list_myEdit=myEditMapper.findAllEdit();
        Map<String, Object> data = new HashMap<>();
        data.put("data", list_myEdit);
        //data 用于当前账户的信息处理
        return Result.success(data);
    }
    @PostMapping("/getMyEdit")
    public Result getMyEdit(int id){
        // 调用业务对象的方法执行登录，并获取返回值
        MyEdit myEdit = myEditMapper.findMyEditById(id);
        // 将以上返回值和状态码OK封装到响应结果中并返回
        return Result.success(myEdit);
    }

    @PostMapping ("/updateEdit")
    public Result updateEdit(String info, String title,int myEditId) {
        MyEdit myEdit = myEditMapper.findMyEditById(myEditId);
        myEdit.setTitle(title);
        myEdit.setInfo(info);
        myEdit.setCtime(new java.util.Date());
        myEditMapper.updateMyEdit(myEdit);
        log.info("更新成功");
        //data 用于当前账户的信息处理
        return  Result.success(myEdit);
    }

    @DeleteMapping("/deleteEdit")
    public Result deleteEdit(Integer myEditId) {
        myEditMapper.deleteMyEditById(myEditId);
        log.info("删除备忘录成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }
}
