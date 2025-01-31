package web.sn.dream.service.impl;


import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint("/websocket")
@Component
public class WebSocketServer {
    //在线用户数
    private static int onlineCount = 0;
    //存储用户
    private static CopyOnWriteArraySet<WebSocketServer> webSockerServers = new CopyOnWriteArraySet<>();
    private Session session;
    private String sid = "";

    //当有客户端连接到服务器时调用
    @OnOpen
    public void onOpen(Session session){
        this.session = session;
        webSockerServers.add(this);
        addOnlineCount();
    }

    //当有客户端断开连接时调用
    @OnClose
    public void onClose(){
        webSockerServers.remove(this);
        subOnlineCount();
    }


    //当收到客户端发送的消息时调用
    @OnMessage
    public void onMessage(String message,Session session){
        for(WebSocketServer item : webSockerServers){
            try {
                item.sendMessage(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    //当收到客户端发送的错误消息时调用
    @OnError
    public void onError(Session session,Throwable error){
        error.printStackTrace();
    }

    //服务器发送信息给客户端
    public void sendMessage(String message) throws IOException{
//      this.session.getBasicRemote().sendText(message);//同步发送
        this.session.getAsyncRemote().sendText(message); //异步发送
    }

    //群发消息
    public static void  sendInfo(String message) throws IOException{
        for(WebSocketServer item : webSockerServers){
            try{
                item.sendMessage(message);
            }catch (IOException e){
                continue;
            }
        }
    }

    //获取在线用户数
    public static synchronized int getOnlineCount(){
        return onlineCount;
    }

    //增加在线用户数
    public static synchronized void addOnlineCount(){
        WebSocketServer.onlineCount ++;
    }

    //减少在线用户数
    public static synchronized void subOnlineCount(){
        WebSocketServer.onlineCount --;
    }
}