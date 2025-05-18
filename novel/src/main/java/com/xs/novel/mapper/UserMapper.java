package com.xs.novel.mapper;


import org.apache.ibatis.annotations.Mapper;
import com.xs.novel.pojo.User;

import java.util.List;

@Mapper //应用程序在运行时会自动的为该接口生成一个实现类（代理对象），并且会自动将该实现对象放入ioc容器中，成为IOC容器管理的bean
public interface UserMapper {

    Integer insertUser (User user);

    User findUserByName(String username);

    User findUserById(int userId);

    void  updateUser(User user);

    List<User> getAllUser();
}
