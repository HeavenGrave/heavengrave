package web.sn.dream.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.Map;
@Slf4j
@Controller

public class StompController {
    @MessageMapping("/sendMessage")  // 处理客户端发送到 `/app/sendMessage` 的消息
    @SendTo("/topic/messages")       // 将返回值发送到 `/topic/messages`，所有订阅该主题的客户端都会收到
    public Object  handleJson(@RequestBody Object  message) {
        Map<String, Object> response = new HashMap<>();
        response.put("received", message);
        log.info("Received message: {}", message);
        return response;
    }
}