package web.sn.dream.controller;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
import web.sn.dream.mapper.UserMapper;
import web.sn.dream.pojo.LoginInfo;
import web.sn.dream.pojo.Result;
import web.sn.dream.pojo.User;
import web.sn.dream.service.UserService;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController //标识当前类是一个请求处理类
@RequestMapping("user")
public class UserController{
    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 用户注册
     * @param user
     * @return
     */
    @RequestMapping("/reg")
    public Result reg(User user){
        //在redis中查找用户名是否存在
        boolean exists = redisTemplate.hasKey(user.getName());
        if(exists){
            return Result.error("用户名已存在!");
        }
        String check=userService.registerUser(user);
        if(check.equals("注册成功")){
            redisTemplate.opsForValue().set(user.getName(),user.getPassword());
            return Result.success(check);
        }else{
            return Result.error(check);
        }
    }

    /**
     * 用户登录
     * @param name
     * @param password
     * @return
     */
    @PostMapping("/login")
    public Result login(String name, String password, HttpServletRequest request, HttpServletResponse  response) {
        //在redis中查找用户名是否存在
//        boolean exists = redisTemplate.hasKey(name);
//        if (!exists){
//            return Result.error("用户名不存在");
//        }
        // 调用业务对象的方法执行登录，并获取登录信息对象
        LoginInfo data = userService.login(name,password);
        if(data==null){
            return Result.error("用户名不存在或密码错误！");
        }else {
            // 2. 创建服务端Session（可选显式创建）
            HttpSession session = request.getSession(true); // true表示不存在则新建
            //登录成功后，将id和name存入到HttpSession中
            session.setAttribute("id", data.getId());
            session.setAttribute("name", data.getName());
            session.setAttribute("user", data);
            session.setMaxInactiveInterval(1800); // Session过期时间30分钟
            // 3. 生成自定义Token（如JWT）
            String token = data.getToken();
            // 4. 将SessionID和Token分别存入Cookie
            // ========== Session ID Cookie ==========
            Cookie sessionCookie = new Cookie("SESSION_ID", session.getId());
            sessionCookie.setHttpOnly(true);     // 防XSS
//            sessionCookie.setSecure(true);       // 仅HTTPS
            sessionCookie.setPath("/");          // 全路径有效
            sessionCookie.setMaxAge(1800);       // 与Session过期时间一致
            response.addCookie(sessionCookie);
            // ========== 自定义Token Cookie ==========
            Cookie tokenCookie = new Cookie("authToken", token);
            tokenCookie.setHttpOnly(true);
//            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");         // 仅API路径携带
            tokenCookie.setMaxAge(3600);         // Token过期时间1小时
            response.addCookie(tokenCookie);
            return Result.success(data);
        }
    }

    /**
     *  生成会话标识
     * @return
     */
    private String generateSessionId() {
        // 可以使用系统标识或随机字符串生成会话标识
        // 这里仅作示例，使用随机UUID生成会话标识
        return UUID.randomUUID().toString();
    }

    @GetMapping("/getUserInfo")
    public Result getUserInfo(HttpSession session){
        User user = userMapper.findUserByName(session.getAttribute("name").toString());
        return  Result.success(user);
    }


//    /**
//     * 用户更新
//     * @param userId
//     * @return
//     */
//    @RequestMapping("/update")
//    public JsonResult<User> updateUserInfo(int userId, String userName, String userSign,String image){
//        User user = userMapper.findUserById(userId);
//        if(userName!=null&&!"".equals(userName)){
//            user.setName(userName);
//        }
//        if(userSign!=null&&!"".equals(userSign)){
//            user.setSignature(userSign);
//        }
//        if(image!=null&&!"".equals(image)){
//            user.setImage(image);
//        }
//        userMapper.updateUser(user);
//        // 将以上返回值和状态码OK封装到响应结果中并返回
//        return new JsonResult<User>(OK, user);
//    }
}
