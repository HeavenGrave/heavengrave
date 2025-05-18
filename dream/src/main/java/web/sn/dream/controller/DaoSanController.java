package web.sn.dream.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 到三游戏接口文件
 * @author Stan
 * @version 1.0
 * @description: TODO
 * @date 2023/7/13 21:06
 */
@RestController
@RequestMapping("daoSan")
public class DaoSanController {
//
//    @Autowired
//    private DaoSanServiceImpl daoSanService;
//    @Autowired
//    private UserMapper userMapper;
//
//    static  ArrayList<Card> oneBox_new=new ArrayList<>();
//
//    static{
//        //创建一幅牌
//        int index=1;
//        String [] ses={"RedHearts","Spades","Square","ThePlumBlossom"};
//        String [] nums={"A","2","3","4","5","7","8","9","10","J","Q","K"};
//        int [] lights={14,15,16,17,5,7,8,9,10,11,12,13};
//        for(String se : ses){
//            int size =1;
//            for(int i=0;i<nums.length;i++){
//                Card card=new Card();
//                card.setDecor(se);
//                card.setNumber(nums[i]);
//                card.setId(index);
//                if(size==6){
//                    size++;
//                }
//                card.setSize(size);
//                if(se.equals("RedHearts")&&lights[i]==16){
//                    card.setLenght(19);
//                }else  if(se.equals("Square")&&lights[i]==16){
//                    card.setLenght(18);
//                }else{
//                    card.setLenght(lights[i]);
//                }
//                index++;
//                size++;
//                oneBox_new.add(card);
//            }
//        }
//        Card card_dw=new Card();
//        card_dw.setNumber("DW");
//        card_dw.setSize(15);
//        card_dw.setDecor("color");
//        card_dw.setLenght(21);
//        card_dw.setId(index);
//        index++;
//        oneBox_new.add(card_dw);
//        Card card_xw=new Card();
//        card_xw.setNumber("XW");
//        card_xw.setSize(14);
//        card_xw.setDecor("grey");
//        card_xw.setLenght(20);
//        card_xw.setId(index);
//        oneBox_new.add(card_xw);
//    }
//
//    /**
//     * 创建倒三游戏房间
//     * @param session
//     * @return
//     */
//    @RequestMapping("/create")
//    public JsonResult<Map<String, Object>> create(HttpSession session){
//        DaoSan daoSan =new DaoSan();
//        // 获取当前时间
//        LocalDateTime currentTime = LocalDateTime.now();
//        // 定义日期时间格式
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
//        // 格式化当前时间
//        String formattedTime = currentTime.format(formatter);
//        String[] nums=formattedTime.split(":");
//
//        //将当前时间作为房间号,可以避免房间ID重复,也可以让房间号变的没有那么复杂   因为只使用了6位数字   需要一个月清除一次数据库   后续可以研究一个定时任务
//        String roomId="";
//        for(String num:nums){
//            roomId+=num;
//        }
//        //初始化游戏房间信息
//        daoSan.setId(roomId);
//        daoSan.setCreateuser(getUsernameFromSession(session)); //创建人
//        daoSan.setPlayer1(getUsernameFromSession(session)); //创建人即为1号玩家
//        daoSan.setPlayernum(1); //当前对局加入的玩家数
//        //将当前数据插入数据库
//        daoSanService.insertDaosn(daoSan);
//        //输出log信息
//        System.out.println("用户："+daoSan.getCreateuser()+"创建了房间："+roomId+"等待其他玩家进入。。。");
//
//        //拼接post请求返回值
//        Map<String, Object> data = new HashMap<>();
//        data.put("roomId",roomId);//房间ID
//        data.put("daoSan",daoSan);//游戏信息
//        return  new JsonResult<>(OK,data);
//
//    }
//
//    /**
//     * 加入一场游戏
//     * @param roomId
//     * @param session
//     * @return
//     */
//    @RequestMapping("/add")
//    public JsonResult<Map<String, Object>> add(String roomId,HttpSession session) {
//        // 根据房间id查询游戏
//        DaoSan daoSan = daoSanService.findDaosnById(roomId);
//        //从session中获取当前用户名称
//        String name =getUsernameFromSession(session);
//        //输出log信息
//        System.out.println("用户："+name+"加入了房间："+roomId);
//        //当前玩家编号
//        int nowNum = daoSan.getPlayernum();
//        //判断是否为新玩家
//        Boolean ifNewPlayer=true;
//        if(daoSan.getPlayer1().equals(name)){
//            ifNewPlayer=false;
//        }else if(daoSan.getPlayer2()!=null&&daoSan.getPlayer2().equals(name)){
//            ifNewPlayer=false;
//        }else if(daoSan.getPlayer3()!=null&&daoSan.getPlayer3().equals(name)){
//            ifNewPlayer=false;
//        }else if(daoSan.getPlayer4()!=null&&daoSan.getPlayer4().equals(name)){
//            ifNewPlayer=false;
//        }else if(daoSan.getPlayer5()!=null&&daoSan.getPlayer5().equals(name)){
//            ifNewPlayer=false;
//        }
//        Map<String, Object> data = new HashMap<>();
//        if(ifNewPlayer) {
//            JSONObject json = new JSONObject();
//            if (nowNum == 1) {
//                daoSan.setPlayer2(name);
//            } else if (nowNum == 2) {
//                daoSan.setPlayer3(name);
//            } else if (nowNum == 3) {
//                daoSan.setPlayer4(name);
//            } else if (nowNum == 4) {
//                daoSan.setPlayer5(name);
//            } else if (nowNum == 5) {
//                data.put("type", "addGameError");
//                data.put("daoSan", daoSan);
//                return new JsonResult<>(OK, data);
//            }
//            daoSan.setPlayernum((nowNum + 1));
//            //更新游戏数据
//            daoSanService.updateDaoSan(daoSan);
//            json.put("type", "addGame");
//            //当前对局信息
//            json.put("daoSan", daoSan);
//            json.put("playernum", daoSan.getPlayernum());//当前玩家编号 座位号
//            try {
//                //发送websocket，告诉其他人加入了新的玩家
//                WebSocketServer.sendInfo(json.toString());
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//            //拼接返回数据
//            data.put("type", "addGame");
//            data.put("daoSan", daoSan);
//        }else{
//            //拼接返回数据
//            data.put("type", "addOldGame");
//            data.put("daoSan", daoSan);
//            //后续添加找回对局的逻辑
//        }
//        //data 用于当前账户的信息处理
//        return new JsonResult<>(OK, data);
//    }
//
//
//    /**
//     * 房主开启游戏对局
//     * @param roomId
//     * @param session
//     */
//    @RequestMapping("/start")
//    public void start(String roomId,HttpSession session) {
//        //从session中获取当前用户名称
//        String name =getUsernameFromSession(session);
//        //输出log信息
//        System.out.println("用户："+name+" 作为房主开始了游戏  房间号为："+roomId);
//        //洗牌   将牌随机打乱
//        Collections.shuffle(oneBox_new);
//        ArrayList<Card> cords1=new ArrayList<>();
//        ArrayList<Card> cords2=new ArrayList<>();
//        ArrayList<Card> cords3=new ArrayList<>();
//        ArrayList<Card> cords4=new ArrayList<>();
//        ArrayList<Card> cords5=new ArrayList<>();
//        int num=1; //玩家编号
//        //将牌顺序分发给五个人
//        for(Card card:oneBox_new){
//            if(num==1){
//                cords1.add(card);
//                num++;
//            }else if(num==2){
//                cords2.add(card);
//                num++;
//            }else if(num==3){
//                cords3.add(card);
//                num++;
//            }else if(num==4){
//                cords4.add(card);
//                num++;
//            }else if(num==5){
//                cords5.add(card);
//                num=1;
//            }
//        }
//        JSONObject json = new JSONObject();
//        json.put("type","distributedCard");//发牌
//        json.put("player1",cords1);
//        json.put("player2",cords2);
//        json.put("player3",cords3);
//        json.put("player4",cords4);
//        json.put("player5",cords5);
//        try {
//            //发送websocket，告诉其他人开始游戏了
//            WebSocketServer.sendInfo(json.toString());
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    /**
//     * 出牌或让步
//     * @param type 出牌 让步 喝风
//     * @param cards 出的牌
//     * @param num 玩家编号
//     * @param name 玩家名称
//     */
//    @RequestMapping("/outCard")
//    public void outCard(String type,String cards, String num,String name){
//
//        JSONObject json = new JSONObject();
//        //根据自定义转换的方法  将json信息 转化为卡牌JsonNode的数组
//        List<JsonNode> list_json = parseJson(cards);//上家出的牌
//        List<Card> list_card =new ArrayList<>();
//        String cardInfo="";
//       //通过遍历 将卡牌JsonNode数组信息转为为卡牌对象数组信息
//        for(JsonNode json1:list_json){
//            Card card=new Card();
//            if(json1.has("id")){
//                card.setId(json1.get("id").asInt());
//                card.setDecor(json1.get("decor").asText());
//                card.setSize(json1.get("size").asInt());
//                card.setNumber(json1.get("number").asText());
//                card.setLenght(json1.get("lenght").asInt());
//                list_card.add(card);
//                cardInfo+=card.getDecor()+" "+card.getNumber()+"; ";
//            }
//        }
//        //输出log信息
//        System.out.println("用户："+name+"出了："+list_card.size()+"张牌;  玩家编号为："+num+" 牌的信息如下:");
//        System.out.println(cardInfo);
//        //根据出牌类型进行操作
//        if(type.equals("outCard")){//当前为出牌
//            if(list_card.size()>0){//出牌数不为0
//                json.put("type","outNext");//下家请出牌
//                json.put("outCards",list_card);
//                json.put("outName",name);
//                //下家  玩家编号
//                if(Integer.parseInt(num)+1>5){
//                    json.put("nextNum",1);
//                }else {
//                    json.put("nextNum", Integer.parseInt(num) + 1);
//                }
//            }else { //出牌数为0  即为让步  一般用于已经出完牌的玩家
//                json.put("type","outNext");//下家请出牌
//                json.put("outCards",list_card);
//                json.put("outName",name);
//                json.put("nextNum",Integer.parseInt(num));
//            }
//        }else if(type.equals("passCard") ){ //让步
//            json.put("type","outNext");
//            json.put("outCards",list_card);
//            json.put("outName",name);
//            //下家  玩家编号
//            if(Integer.parseInt(num)+1>5){
//                json.put("nextNum",1);
//            }else {
//                json.put("nextNum", Integer.parseInt(num) + 1);
//            }
//        }else {//喝风
//            json.put("type","outNext");
//            json.put("outCards",list_card);
//            //根据房间id获取游戏数据
//            DaoSan daoSan = daoSanService.findDaosnById(type);
//            //获取当前玩家的编号
//            if(daoSan.getPlayer1().equals(name)){
//                json.put("outName",daoSan.getPlayer2());
//            }else if(daoSan.getPlayer2().equals(name)){
//                json.put("outName",daoSan.getPlayer3());
//            }else if(daoSan.getPlayer3().equals(name)){
//                json.put("outName",daoSan.getPlayer4());
//            }else if(daoSan.getPlayer4().equals(name)){
//                json.put("outName",daoSan.getPlayer5());
//            }else if(daoSan.getPlayer5().equals(name)){
//                json.put("outName",daoSan.getPlayer1());
//            }
//            //下家  玩家编号
//            if(Integer.parseInt(num)+1>5){
//                json.put("nextNum",1);
//            }else {
//                json.put("nextNum", Integer.parseInt(num) + 1);
//            }
//        }
//
//        try {
//            //发送websocket，告诉其他人出了什么牌
//            WebSocketServer.sendInfo(json.toString());
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//
//    /**
//     * 亮个三
//     * @param type 3的花色
//     * @param num 用户座位号
//     * @param name 用户名称
//     */
//    @RequestMapping("/lightSan")
//    public void lightSan(String type,String num,String name){
//        JSONObject json = new JSONObject();
//        //输出log信息
//        System.out.println("用户："+name+"亮了："+type+"三  座位号为："+num);
//        json.put("type","lightSan");//操作类型
//        json.put("decor",type);//花色
//        json.put("player",name);//亮三用户
//        json.put("num",num);//座位号
//        try {
//            //发送webSocket信息 广播亮三的信息
//            WebSocketServer.sendInfo(json.toString());
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    /**
//     * 格式化json
//     * @param jsonData
//     * @return
//     */
//    public static List<JsonNode> parseJson(String jsonData) {
//        List<JsonNode> result = new ArrayList<>();
//        ObjectMapper mapper = new ObjectMapper();
//
//        try {
//            JsonNode data = mapper.readTree(jsonData);
//            for (JsonNode group : data) {
//                JsonNode entry = mapper.createObjectNode();
//                // 提取属性值
//                ((ObjectNode)entry).put("id", group.get("id").asInt());
//                ((ObjectNode)entry).put("number", group.get("number").asText());
//                ((ObjectNode)entry).put("decor", group.get("decor").asText());
//                ((ObjectNode)entry).put("size", group.get("size").asInt());
//                ((ObjectNode)entry).put("lenght", group.get("lenght").asInt());
//                result.add(entry);
//            }
//        } catch (JsonProcessingException e) {
//            e.printStackTrace();
//        }
//
//        return result;
//    }
//
//
//    /**
//     * 出完了
//     * @param num
//     * @param name
//     */
//    @RequestMapping("/win")
//    public void Win(String num,String name,String type){
//        JSONObject json = new JSONObject();
//        //输出log信息
//        System.out.println("用户："+name+"出完了； 类型："+type+"  玩家编号："+num);
//        json.put("type","PlayerWin");
//        json.put("player",name);
//        json.put("playerNum",num);
//        json.put("playerType",type);
//        try {
//            WebSocketServer.sendInfo(json.toString());
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    /**
//     * 更新用户积分
//     * @param result
//     */
//    @RequestMapping("/updateUserScore")
//    public JsonResult<Map<String, Object>> Win(int result,String name){
//        User user = userMapper.findUserByName(name);
//        user.setScore(user.getScore()+result);
//        //更新用户信息
//        userMapper.updateUser(user);
//        System.out.println("用户："+name+"更新了积分; 当前的积分为："+(user.getScore()));
//        return  new JsonResult<>(OK);
//    }
//
}


