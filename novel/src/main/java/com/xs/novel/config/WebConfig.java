package com.xs.novel.config;

import com.xs.novel.interceptor.TokenInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


import java.util.ArrayList;
import java.util.List;

/**
 * 配置类
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // 创建拦截器对象
    @Autowired
    private TokenInterceptor tokenInterceptor;
    /** 拦截器配置 */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
//        // 白名单
        List<String> patterns = new ArrayList<String>();
//        //静态资源
//        patterns.add("/docs/**");
//        patterns.add("/image/**");
//        patterns.add("/pages/**");
//        patterns.add("/js/**");
//        patterns.add("/css/**");
//        patterns.add("/users/login");
//        patterns.add("/users/reg");
//        patterns.add("/game/**");
//        patterns.add("/edit/**");
//        patterns.add("/todo/**");
        //登录页面
        patterns.add("/favicon.ico");
        patterns.add("/login");
//        //主页
//        patterns.add("/welcome");
//        //文档编辑
//        patterns.add("/myEdit");
////        patterns.add("/showEdit");
//        //测试路径
//        patterns.add("/test");
//        patterns.add("/wx/**");
//        //我的代办
//        patterns.add("/myToDo");

        patterns.add("/static/**");
        patterns.add("/druid");
        patterns.add("/fileUpload");
        patterns.add("/files/**");
        // 通过注册工具添加拦截器
        registry.addInterceptor(tokenInterceptor)
                .addPathPatterns("/**")// 拦截所有请求
                .excludePathPatterns(patterns);//放行哪些请求
          //只放行登录页面和静态资源
//          registry.addInterceptor(new TokenInterceptor())
//                .addPathPatterns("/**")
//                .excludePathPatterns("/login", "/static/**","/favicon.ico","/druid");
    }
}
