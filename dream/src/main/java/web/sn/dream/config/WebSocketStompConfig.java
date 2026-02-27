package web.sn.dream.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker  // 启用 STOMP 消息代理
public class WebSocketStompConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/stomp-websocket")
                .setAllowedOrigins("http://8.141.4.23:8086")
//                .setAllowedOrigins("http://192.168.10.110:8086")
                .withSockJS(); // 支持 SockJS（应对浏览器不支持 WebSocket 的情况）
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic"); // 客户端订阅的主题前缀（服务器向这些主题发消息）
        registry.setApplicationDestinationPrefixes("/app"); // 客户端发送消息到服务器的前缀
    }
}