package com.xs.novel.filter;

import com.xs.novel.utils.JwtUtils;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
//过滤器和拦截器 只用一个  当前项目使用的是拦截器
@Slf4j
//@WebFilter(urlPatterns = "/*")
//public class TokenFilter implements Filter {
public class TokenFilter{
//    //初始化方法, web服务器启动的时候执行, 只执行一次
//    @Override
//    public void init(FilterConfig filterConfig) throws ServletException {
//        log.info("init 初始化方法 ....");
//    }
//    @Override
//    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
//        HttpServletRequest request = (HttpServletRequest) servletRequest;
//        HttpServletResponse response = (HttpServletResponse) servletResponse;
//
//        //1. 获取到请求路径
//        String requestURI = request.getRequestURI(); // /employee/login
//
//        //2. 判断是否是登录请求, 如果路径中包含 /login, 说明是登录操作, 放行
//        if (requestURI.contains("/login")){
//            log.info("登录请求, 放行");
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        //3. 获取请求头中的token
//        String token = request.getHeader("token");
//
//        //4. 判断token是否存在, 如果不存在, 说明用户没有登录, 返回错误信息(响应401状态码)
//        if (token == null || token.isEmpty()){
//            log.info("令牌为空, 响应401");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            return;
//        }
//
//        //5. 如果token存在, 校验令牌, 如果校验失败 -> 返回错误信息(响应401状态码)
//        try {
//            JwtUtils.parseToken(token);
//        } catch (Exception e) {
//            log.info("令牌非法, 响应401");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            return;
//        }
//
//        //6. 校验通过, 放行
//        log.info("令牌合法, 放行");
//        filterChain.doFilter(request, response);
//    }
//    //销毁方法, web服务器关闭的时候执行, 只执行一次
//    @Override
//    public void destroy() {
//        log.info("destroy 销毁方法 ....");
//    }
}
