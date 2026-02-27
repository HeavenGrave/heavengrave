package web.sn.dream.service;

import web.sn.dream.pojo.MyTab;

import java.util.List;

public interface MyTabService {
    void insertMyTab(MyTab myTab);
    List<MyTab> findMyTabByUserIdAndType(int userId,String  type);
    void deleteMyTabById(int id);
    MyTab findMyTabById(int id);
    void updateMyTab(MyTab myTab);
}
