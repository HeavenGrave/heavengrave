package com.xs.novel.service.impl;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import com.xs.novel.mapper.UserMapper;
import com.xs.novel.pojo.LoginInfo;
import com.xs.novel.pojo.User;
import com.xs.novel.service.UserService;
import com.xs.novel.utils.JwtUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service//代表将该类对象交给Spring容器管理
public class UserServiceImpl implements UserService {

    @Autowired //应用程序运行时，会自动的查询该类型的bean对象，并赋值给该成员变量
    private UserMapper userMapper;

    /**
     * 用户注册方法
     * @param user
     */
    @Override
    public String registerUser(User user){
        //通过用户名称查询用户
        User result= userMapper.findUserByName(user.getName());
        if(result!=null){
            log.error("用户名被占用！");
            return "用户名被占用";
        }
        //密码  MD5 加密
        //盐值 +password+盐值
        String oldPassword =user.getPassword();
        String salt= UUID.randomUUID().toString().toUpperCase();
        String newPassword =getMD5Password(oldPassword,salt);
        user.setPassword(newPassword);
        user.setSalt(salt);
        user.setType("普通用户");
        user.setScore(0);
        Integer rows=userMapper.insertUser(user);
        if(rows!=1){
           log.error("在用户注册过程中产生了未知的错误！");
           return "注册失败，未知错误，请联系管理员！";
        }else{
            return "注册成功";
        }
    }

    @Override
    public List<User> getAllUser() {
        return userMapper.getAllUser();
    }

    /**
     * 用户登录方法
     * @param name
     * @param password
     * @return
     */
    @Override
    public LoginInfo login(String name, String password) {
        // 调用userMapper的findByUsername()方法，根据参数username查询用户数据
        User user = userMapper.findUserByName(name);
        // 判断查询结果是否为null
        if (user == null) {
            log.error("用户数据不存在!");
            return null;
        }

        // 从查询结果中获取盐值
        String salt = user.getSalt();
        // 调用getMd5Password()方法，将参数password和salt结合起来进行加密
        String md5Password = getMD5Password(password, salt);
        // 判断查询结果中的密码，与以上加密得到的密码是否不一致
        if (!user.getPassword().equals(md5Password)) {
            // 是：抛出PasswordNotMatchException异常
            log.error("密码验证失败!");
            return null;
        }
        //生成JWT令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put("id",user.getId());
        claims.put("name",user.getName());
        String jwt = JwtUtils.generateToken(claims);
        // 返回用户登录信息对象
        return new LoginInfo(user.getId(),user.getName(),jwt);
    }



    /**
     * 定义一个md5加密算法
     * @param password
     * @param salt
     * @return
     */
    private  String  getMD5Password(String password,String salt){
        for (int i=0;i<3;i++){
            password = DigestUtils.md5DigestAsHex((salt+password+salt).getBytes()).toUpperCase();
        }
       return  password;
    }


}
