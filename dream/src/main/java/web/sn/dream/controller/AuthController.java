package web.sn.dream.controller;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 微信登录接口
 * 小程序端传入 code，后端用 code 向微信换 openid，生成自己的 token 返回
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    // ⚠️ 替换为你小程序的 AppID 和 AppSecret（从微信公众平台获取）
    private static final String APPID     = "wx wx3d9b9992860f5fe8";
    private static final String APPSECRET = "a7f0768c7f6b6068ee216daa7a65cea0";

    // 微信换码接口
    private static final String JSCODE2SESSION_URL =
        "https://api.weixin.qq.com/sns/jscode2session";

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String code = body.get("code");

        if (code == null || code.isBlank()) {
            return error("缺少 code 参数");
        }

        try {
            // ========== 第一步：用 code 向微信换 openid ==========
            // 构建带参数的 URL
            String wxUrl = JSCODE2SESSION_URL
                + "?appid=" + APPID
                + "&secret=" + APPSECRET
                + "&js_code=" + code
                + "&grant_type=authorization_code";

            // 使用 RestTemplate 发起 GET 请求
            ResponseEntity<String> response = restTemplate.getForEntity(
                URI.create(wxUrl), String.class);

            String wxResponse = response.getBody();
            JSONObject wxData = JSON.parseObject(wxResponse);

            String openid = wxData.getString("openid");
            if (openid == null || openid.isBlank()) {
                String errMsg = wxData.getString("errmsg");
                System.err.println("微信换码失败: " + errMsg);
                return error("code 无效或已过期");
            }

            System.out.println("微信登录成功，openid: " + openid);

            // ========== 第二步：生成自己的 Token ==========
            // 实际项目：从数据库查用户，不存在则创建
            String accessToken  = UUID.randomUUID().toString().replace("-", "");
            String refreshToken = UUID.randomUUID().toString().replace("-", "");

            // 实际项目：把 token 存 Redis，设置过期时间
            // redisTemplate.opsForValue().set("token:" + openid, accessToken, 30, TimeUnit.DAYS);

            // ========== 第三步：返回给小程序 ==========
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> data   = new HashMap<>();
            data.put("access_token",  accessToken);
            data.put("refresh_token", refreshToken);
            data.put("user_id",       openid);   // 直接用 openid 作为 user_id
            result.put("data", data);
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return error("服务端异常，请稍后重试");
        }
    }

    /**
     * 刷新 Token
     */
    @PostMapping("/refresh")
    public Map<String, Object> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refresh_token");
        if (refreshToken == null || refreshToken.isBlank()) {
            return error("缺少 refresh_token");
        }

        // 实际项目：从 Redis 验证 refresh_token，查出 openid，生成新 access_token
        // 这里做简化处理
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> data   = new HashMap<>();
        data.put("access_token", UUID.randomUUID().toString().replace("-", ""));
        result.put("data", data);
        return result;
    }

    /**
     * 更新用户资料（头像、昵称）
     */
    @PostMapping("/update-profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, Object> body) {
        // 实际项目：从 token 取出 userId，存数据库
        String userId = (String) body.get("user_id");

        Map<String, Object> result = new HashMap<>();
        Map<String, Object> data   = new HashMap<>();

        Map<String, Object> userinfo = new HashMap<>();
        userinfo.put("id",       userId != null ? userId : "user_001");
        userinfo.put("nickname", body.getOrDefault("nickname", "用户" + System.currentTimeMillis() % 1000));
        userinfo.put("avatar",   body.getOrDefault("avatar", ""));
        userinfo.put("bio",      "");

        data.put("userinfo", userinfo);
        result.put("data", data);
        return result;
    }

    // ===== 通用响应方法 =====
    private Map<String, Object> error(String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("code", 400);
        res.put("message", message);
        return res;
    }
}
