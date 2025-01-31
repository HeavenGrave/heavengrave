package web.sn.dream.service.impl;


import web.sn.dream.pojo.MyEdit;
import web.sn.dream.mapper.MyEditMapper;
import web.sn.dream.service.MyEditService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Slf4j
@Service
public class MyEditServiceImpl implements MyEditService {
    @Autowired
    private MyEditMapper myEditMapper;

    public void insertMyEdit(MyEdit myEdit){
        Integer rows=myEditMapper.insertMyEdit(myEdit);
        if(rows!=1){
            log.error("在用户注册过程中产生了未知的错误！");
        }
    }


}
