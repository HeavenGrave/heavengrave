package com.xs.novel.interceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpSession;
import com.xs.novel.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 令牌校验的拦截器
 */
@Slf4j
@Component
public class TokenInterceptor implements HandlerInterceptor {
    /**
     * 检查请求路径是否需要验证
     * @param request
     * @return
     */
    private boolean excludePath(HttpServletRequest request) {
        String path = request.getRequestURI();
        // 配置无需拦截的路径，如登录、注册、静态资源
        return path.startsWith("/user/login") ||path.startsWith("/user/reg")|| path.startsWith("/static/");
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        //1.排除无需验证的路径
        if (excludePath(request)) {
            return true;
        }
        // 检查Session
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            return true; // Session验证通过
        }

        // 从Cookie获取Token
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        // Token验证逻辑
        //4. 判断token是否存在, 如果不存在, 说明用户没有登录, 返回错误信息(响应401状态码)
        if (token == null || token.isEmpty()){
            log.info("令牌为空, 响应401");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.sendRedirect("/login");
            return false;
        }
        //5. 如果token存在, 校验令牌, 如果校验失败 -> 返回错误信息(响应401状态码)
        try {
            JwtUtils.parseToken(token);
        }  catch (io.jsonwebtoken.ExpiredJwtException e) {
            // 令牌已过期
            log.info("令牌已过期");
            response.sendRedirect("/login");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        } catch (io.jsonwebtoken.security.SignatureException e) {
            // 令牌签名无效
            log.info("令牌签名无效");
            response.sendRedirect("/login");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        } catch (io.jsonwebtoken.JwtException e) {
            // 其他 JWT 相关异常
            log.info("JWT 异常: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // 双重验证失败
        response.sendRedirect("/login");
        return false;
    }
}
