package com.xs.novel.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

public class JwtUtils {
    // 使用 Keys 类生成一个符合 HS256 要求的密钥
    private static final SecretKey SECRET_KEY_BYTES = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);;
    private static final long EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12小时
    /**
     * 生成JWT令牌
     * @param claims 令牌中包含的信息
     * @return 生成的JWT令牌字符串
     */
    public static String generateToken(Map<String, Object> claims) {
        return Jwts.builder()
                .signWith(SECRET_KEY_BYTES, Jwts.SIG.HS256)
                .claims(claims)
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .compact();
    }

    /**
     * 解析JWT令牌
     * @param token 要解析的JWT令牌字符串
     * @return 包含令牌信息的Claims对象
     * @throws Exception 如果令牌无效或已过期，则抛出异常
     */
    public static Claims parseToken(String token) throws Exception{
        return Jwts.parser().verifyWith(SECRET_KEY_BYTES).build().parseSignedClaims(token).getPayload();
    }
}