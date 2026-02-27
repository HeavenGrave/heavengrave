package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.MyTabMapper;
import web.sn.dream.pojo.MyTab;
import web.sn.dream.service.MyTabService;

import java.util.List;

@Slf4j
@Service
public class MyTabServiceImpl implements MyTabService {
    @Autowired
    private MyTabMapper myTabMapper;
    @Override
    public void insertMyTab(MyTab myTab) {
        myTabMapper.insertMyTab(myTab);
    }

    @Override
    public List<MyTab> findMyTabByUserIdAndType(int userId, String type) {
        return myTabMapper.findMyTabByUserIdAndType(userId, type);
    }

    @Override
    public void deleteMyTabById(int id) {
        myTabMapper.deleteMyTabById(id);
    }

    @Override
    public MyTab findMyTabById(int id) {
        return myTabMapper.findMyTabById(id);
    }

    @Override
    public void updateMyTab(MyTab myTab) {
        myTabMapper.updateMyTab(myTab);
    }
}
