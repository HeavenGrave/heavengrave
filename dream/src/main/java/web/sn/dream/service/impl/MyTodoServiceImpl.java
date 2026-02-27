package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.MyToDoMapper;
import web.sn.dream.service.MyToDoService;

@Slf4j
@Service
public class MyTodoServiceImpl implements MyToDoService {
    @Autowired
    private MyToDoMapper myToDoMapper;

}
