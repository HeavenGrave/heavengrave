package com.xs.novel.service;

import org.springframework.stereotype.Service;
import com.xs.novel.pojo.LoginInfo;
import com.xs.novel.pojo.User;

import java.util.List;

@Service//代表将该类对象交给Spring容器管理
public interface UserService {
    /**
     *登录验证
     * @param name
     * @param password
     * @return
     */
    LoginInfo login(String name, String password);

    /**
     * 用户注册
     * @param user
     */
    String registerUser(User user);

    List<User> getAllUser();
}
