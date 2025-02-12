package web.sn.dream.websoket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * 主动发送消息给前端
     *
     * @param destination 目的地（前端订阅的地址）
     * @param payload     消息内容
     */
    public void sendMessageToClient(String destination, Object payload) {
        messagingTemplate.convertAndSend(destination, payload);
    }
}
