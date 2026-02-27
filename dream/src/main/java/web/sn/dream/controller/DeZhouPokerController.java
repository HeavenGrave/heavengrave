package web.sn.dream.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.sn.dream.mapper.UserMapper;
import web.sn.dream.pojo.*;
import web.sn.dream.service.DeZhouPokerService;
import web.sn.dream.websoket.WebSocketService;

import javax.smartcardio.Card;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("deZhou")
public class DeZhouPokerController {

    @Autowired
    private DeZhouPokerService deZhouPokerService;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private WebSocketService webSocketService;

    static ArrayList<CardPoker> oneBox_new = new ArrayList<>();

    static {
        //创建一幅牌
        int index = 1;
        String[] decors = {"RedHearts", "Spades", "Square", "ThePlumBlossom"};
        String[] nums = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};
        for (String decor : decors) {
            int size = 1;
            for (int i = 0; i < nums.length; i++) {
                CardPoker card = new CardPoker();
                card.setDecor(decor);
                card.setName(nums[i]);
                card.setId(index);
                card.setSize(size);
                index++;
                size++;
                oneBox_new.add(card);
            }
        }
    }

    /**
     * 创建德州游戏房间
     *
     * @param session
     * @return
     */
    @RequestMapping("/create")
    public Result create(Integer userNum, String deal, Integer price, HttpSession session) {
        DeZhouPoker deZhouPoker = new DeZhouPoker();
        // 获取当前时间
        LocalDateTime currentTime = LocalDateTime.now();
        // 定义日期时间格式
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        // 格式化当前时间
        String formattedTime = currentTime.format(formatter);
        String[] nums = formattedTime.split(":");
        //将当前时间作为房间号,可以避免房间ID重复,也可以让房间号变的没有那么复杂   因为只使用了6位数字   需要一个月清除一次数据库   后续可以研究一个定时任务
        StringBuilder roomId = new StringBuilder();
        for (String num : nums) {
            roomId.append(num);
        }
        //初始化游戏房间信息
        deZhouPoker.setId(roomId.toString());
        deZhouPoker.setCreateUserId(session.getAttribute("id").toString()); //创建人id
        deZhouPoker.setCreateUserName(session.getAttribute("name").toString()); //创建人名称
        deZhouPoker.setPlayer1(session.getAttribute("name").toString()); //创建人即为1号玩家
        deZhouPoker.setPlayerNum(1); //当前对局加入的玩家数
        deZhouPoker.setPrice(price);
        deZhouPoker.setDealer(1);
        deZhouPoker.setStatus(1);
        deZhouPoker.setCreateTime(new Date());
        //更新当前用户创建的所有房间状态为0
        DeZhouPoker deZhouPoker_update = new DeZhouPoker();
        deZhouPoker_update.setCreateUserId(session.getAttribute("id").toString());
        deZhouPoker_update.setStatus(0);
        boolean check = deZhouPokerService.updateDeZhouPokerByCreateId(deZhouPoker_update);
        //将当前数据插入数据库
        deZhouPokerService.insertDeZhouPoker(deZhouPoker);
        //输出log信息
        System.out.println("用户：" + session.getAttribute("name").toString() + "创建了德扑房间：" + roomId + "等待其他玩家进入。。。");
        //拼接post请求返回值
        Map<String, Object> data = new HashMap<>();
        data.put("roomId", roomId.toString());//房间ID
        data.put("deZhouPoker", deZhouPoker);//游戏信息
        return Result.success(data);
    }

    /**
     * 加入一场游戏
     *
     * @param roomId
     * @param session
     * @return
     */
    @PostMapping("/add")
    public Result add(String roomId, HttpSession session) {
        // 根据房间id查询游戏
        DeZhouPoker deZhouPoker = deZhouPokerService.findDeZhouPokerById(roomId);
        //输出log信息
        System.out.println("用户：" + session.getAttribute("name").toString() + "加入了房间：" + roomId);
        //当前玩家编号
        int nowNum = deZhouPoker.getPlayerNum();
        //判断是否为新玩家
        Boolean ifNewPlayer = true;
        if (deZhouPoker.getPlayer1().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        } else if (deZhouPoker.getPlayer2() != null && deZhouPoker.getPlayer2().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        } else if (deZhouPoker.getPlayer3() != null && deZhouPoker.getPlayer3().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        } else if (deZhouPoker.getPlayer4() != null && deZhouPoker.getPlayer4().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        }else if (deZhouPoker.getPlayer5() != null && deZhouPoker.getPlayer5().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        }else if (deZhouPoker.getPlayer6() != null && deZhouPoker.getPlayer6().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        }else if (deZhouPoker.getPlayer7() != null && deZhouPoker.getPlayer7().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        }else if (deZhouPoker.getPlayer8() != null && deZhouPoker.getPlayer8().equals(session.getAttribute("name").toString())) {
            ifNewPlayer = false;
        }
        Map<String, Object> data = new HashMap<>();
        if (ifNewPlayer) {
            if (nowNum == 1) {
                deZhouPoker.setPlayer2(session.getAttribute("name").toString());
            } else if (nowNum == 2) {
                deZhouPoker.setPlayer3(session.getAttribute("name").toString());
            } else if (nowNum == 3) {
                deZhouPoker.setPlayer4(session.getAttribute("name").toString());
            }  else if (nowNum == 4) {
                deZhouPoker.setPlayer5(session.getAttribute("name").toString());
            }  else if (nowNum == 5) {
                deZhouPoker.setPlayer6(session.getAttribute("name").toString());
            }  else if (nowNum ==6) {
                deZhouPoker.setPlayer7(session.getAttribute("name").toString());
            }  else if (nowNum == 7) {
                deZhouPoker.setPlayer8(session.getAttribute("name").toString());
            }  else if (nowNum == 8) {
                data.put("type", "addGameError");
                data.put("deZhouPoker", deZhouPoker);
                return Result.success(data);
            }
            deZhouPoker.setPlayerNum(nowNum + 1);
            //更新游戏数据
            boolean check = deZhouPokerService.updateDeZhouPoker(deZhouPoker);
            if (check) {
                log.info(data.toString());
                data.put("type", "addGame");
                data.put("deZhouPoker", deZhouPoker);
                data.put("playerNum", deZhouPoker.getPlayerNum());//当前玩家编号 座位号
                webSocketService.sendMessageToClient("/topic/messages", data);
            } else {
                System.out.println("用户：" + session.getAttribute("name").toString() + "加入房间：" + roomId + "失败！");
                return Result.error("加入房间失败");
            }
        } else {
            //拼接返回数据
            data.put("type", "addOldGame");
            data.put("deZhouPoker", deZhouPoker);
            // TODO 后续添加找回对局的逻辑
        }
        //data 用于当前账户的信息处理
        return Result.success(data);
    }

    /**
     * 房主开启游戏对局
     *
     * @param roomId
     * @param session
     */
    @RequestMapping("/start")
    public void start(String roomId, HttpSession session) {
        //从session中获取当前用户名称
        String name = session.getAttribute("name").toString();
        //输出log信息
        System.out.println("用户：" + name + " 作为房主开始了游戏  房间号为：" + roomId);
        //根据房间id查询游戏信息
        DeZhouPoker deZhouPoker = deZhouPokerService.findDeZhouPokerById(roomId);
        deZhouPoker.setStatus(2);//游戏中
        deZhouPokerService.updateDeZhouPoker(deZhouPoker);
        //洗牌   将牌随机打乱
        Collections.shuffle(oneBox_new);
        HashMap<String, Object> json = new HashMap<>();
        json.put("type", "distributedCard");//发牌
        int index = 0;
        for (int i = 1; i <= deZhouPoker.getPlayerNum(); i++) {
            List<CardPoker> cords = new ArrayList<>();
            cords.add(oneBox_new.get(index++));
            cords.add(oneBox_new.get(index++));
            json.put("player" + i, cords);
        }
        List<CardPoker> cords_other = new ArrayList<>();
        //将剩余的牌加入牌堆中
        for (int i = index; i < index+5; i++) {
            cords_other.add(oneBox_new.get(i));
        }
        json.put("other", cords_other);
        json.put("nowDealerNum", 1);
        //发送websocket，告诉其他人开始游戏了
        webSocketService.sendMessageToClient("/topic/messages", json);
    }


    /**
     * 查询当前的活跃的房间信息
     * @return
     */
    @GetMapping("/getRoom")
    public Result getRoom() {
        List<DeZhouPoker> list_mj = deZhouPokerService.findRoomInfoByStatus(1);
        return Result.success(list_mj);
    }


    /**
     * 退出房间并更新房间信息
     * @return
     */
    @PutMapping("/exitRoom")
    public Result exitRoom(String userId) {
        //更新当前用户创建的所有房间状态为0
        DeZhouPoker deZhouPoker_update = new DeZhouPoker();
        deZhouPoker_update.setCreateUserId(userId);
        deZhouPoker_update.setStatus(0);
        boolean check = deZhouPokerService.updateDeZhouPokerByCreateId(deZhouPoker_update);
        if (check) {
            System.out.println("用户：" + userId + " 退出房间");
            return Result.success("退出成功！");
        } else {
            System.out.println("用户：" + userId + " 退出房间失败");
            return Result.error("退出失败！");
        }
    }

    /**
     * 开启下一局游戏
     *
     * @param roomId
     * @param session
     */
    @RequestMapping("/startNext")
    public void startNext(String roomId, Integer nowDealerNum, HttpSession session) {
        //从session中获取当前用户名称
        String name = session.getAttribute("name").toString();
        //输出log信息
        System.out.println("用户：" + name + " 作为房主开始了下一局游戏  房间号为：" + roomId);
        //根据房间id查询游戏信息
        DeZhouPoker deZhouPoker = deZhouPokerService.findDeZhouPokerById(roomId);
        //洗牌   将牌随机打乱
        Collections.shuffle(oneBox_new);
        int index = 0;
        List<CardPoker> cords_other = new ArrayList<>();
        HashMap<String, Object> json = new HashMap<>();
        for (int i = 1; i <= deZhouPoker.getPlayerNum(); i++) {
            List<CardPoker> cords = new ArrayList<>();
            cords.add(oneBox_new.get(index++));
            cords.add(oneBox_new.get(index++));
            json.put("player" + i, cords);
        }
        //将剩余的牌加入牌堆中
        for (int i = index; i < oneBox_new.size(); i++) {
            cords_other.add(oneBox_new.get(i));
        }
        json.put("type", "distributedCardNext");//发牌
        json.put("other", cords_other);
        json.put("nowDealerNum", nowDealerNum);
        //发送websocket，告诉其他人开始游戏了
        webSocketService.sendMessageToClient("/topic/messages", json);
    }
}
