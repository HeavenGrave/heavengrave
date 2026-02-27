package web.sn.dream.controller;

//import com.google.common.net.MediaType;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web.sn.dream.pojo.CharacterVoice;
import web.sn.dream.pojo.NovelInfo;
import web.sn.dream.pojo.Result;
import web.sn.dream.service.CharacterVoiceService;
import web.sn.dream.service.NovelInfoService;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.alibaba.fastjson.JSONObject;
import web.sn.dream.utils.FileUtil;

import java.util.ArrayList;
import java.util.List;


@Slf4j
@RestController
@RequestMapping("novelInfo")
public class NovelInfoController {

    @Autowired
    private NovelInfoService novelInfoService;
    @Autowired
    private CharacterVoiceService characterVoiceService;

    private static String chapterPattern = "^第\\d+章.*$";

    /**
     * 查询小说信息
     * @param novelName
     * @param pageNum
     * @param pageSize
     * @return
     */
    @GetMapping("findNovelInfoByNovelNameToPage")
    public Result findNovelInfoByNovelNameToPage(String novelName,int pageNum, int pageSize) {
        // 根据小说名查询小说信息
        List<NovelInfo> novelInfos = novelInfoService.findNovelInfoByNovelNameToPage(novelName, pageNum, pageSize);
        // 根据条件查询小说总句数
        int total = novelInfoService.findNovelInfoByCondCount(novelName,0,null,null);
        int chapterCount=novelInfoService.findNovelInfoChapterCount(novelName);
        JSONObject json = new JSONObject();
        json.put("total", total);
        json.put("rows", novelInfos);
        json.put("chapterCount", chapterCount);
        return Result.success(json);
    }

    /**
     * 根据条件查询小说信息
     * @param novelName
     * @param pageNum
     * @param pageSize
     * @return
     */
    @GetMapping("findNovelInfoByCondToPage")
    public Result findNovelInfoByCondToPage(String novelName, Integer  chapterNum, String actorName, String emotion,int pageNum, int pageSize) {
        List<NovelInfo> novelInfos = novelInfoService.findNovelInfoByCondToPage(novelName,chapterNum,actorName, emotion, pageNum, pageSize);
        int total = novelInfoService.findNovelInfoByCondCount(novelName,chapterNum,actorName, emotion);
        JSONObject json = new JSONObject();
        json.put("total", total);
        json.put("rows", novelInfos);
        return Result.success(json);
    }


    @GetMapping("findNovelInfoByHaveAudio")
    public Result findNovelInfoByHaveAudio(String novelName) {
        List<NovelInfo> novelInfos = novelInfoService.findNovelInfoByHaveAudio(novelName);
        return Result.success(novelInfos);
    }

    @RequestMapping("updateNovelInfoAudio")
    public Result updateNovelInfoAudio(String novelName) {
        List<NovelInfo> list_novelInfo =novelInfoService.findNovelInfoByNoAudio(novelName);
        for(NovelInfo novelInfo:list_novelInfo){
            if(novelInfo.getActorVoice()!=null&&!novelInfo.getActorVoice().isEmpty()) {
                String filePath = FileUtil.TEXT_TO_AUDIO(novelInfo.getContent(), novelInfo.getActorVoice(), novelInfo.getSpeechRate().intValue(), novelInfo.getTone(), novelInfo.getEmotion(), novelInfo.getChapterNum(), novelInfo.getIndex());
                novelInfo.setNovelVoiceUrl(filePath);
                novelInfoService.updateNovelInfo(novelInfo);
            }
        }
        return Result.success();
    }

    /**
     * 上传小说文件
     * @param file
     * @return
     */
    @RequestMapping("uplaodNovelFile")
    public Result uplaodNovelFile(@RequestParam("file") MultipartFile file)  {
        if (file.isEmpty()) {
            return Result.error("上传文件不能为空!");
        }
        if (!file.getOriginalFilename().endsWith(".txt")) {
            return Result.error("请上传txt格式的文件!");
        }
        // 用于存储读取到的所有行
        List<String> lines = new ArrayList<>();
//        // 读取文件内容
//        StringBuilder content = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
//                content.append(line).append("\n");
                lines.add( line);
            }
        } catch (IOException e) {
            return Result.error("读取文件失败!");
        }
        // 定义匹配"第xxx章xxxxx"的正则表达式
        // 规则说明：
        // 第：固定字符
        // \\d+：匹配1个或多个数字（章节号，比如1、10、100）
        // 章：固定字符
        // .*：匹配任意字符（章节名称，比如“绪论”、“Java IO操作”）
        // ^ 和 $：分别匹配行的开头和结尾（确保整行都是章节格式，可根据需求去掉）
        Pattern pattern = Pattern.compile(chapterPattern);
        StringBuilder nowLineString = new StringBuilder();



        String[] headers = {"id", "content", "chapter_num", "index", "actor"};
        String[] columnKeys = {"id", "content", "chapter_num", "index", "actor"};
        // 移除正文的非法字符
        List<String> lines_new = new ArrayList<String>();
        for (int n=1;n<lines.size();n++) {
            String line = lines.get(n);
            Matcher matcher = pattern.matcher(line);
            if (matcher.matches()) {
                // 匹配成功：是章节行
                if (nowLineString.length() > 0) {
                    lines_new.add(nowLineString.toString());
                }
                nowLineString = new StringBuilder();
                lines_new.add(line);
            } else {
                for (int i = 0; i < line.length(); i++) {
                    char nowKey = line.charAt(i);
                    if (!Character.isSpaceChar(nowKey)) {
                        nowLineString.append(nowKey);
                    }
                }
            }
        }
        lines_new.add(nowLineString.toString());
        String fileName = lines.get(0);
        // 移除《》符号
        String novelName = fileName.replaceAll("[《》]", "");
        novelInfoService.deleteNovelInfoByNovelName(novelName);
        // 处理小说内容
        List<NovelInfo> infos = processNovelInfo(lines_new,novelName);
        // 保存到数据库
        novelInfoService.batchInsertNovelInfo(infos);
        return Result.success(novelName);
    }

    /**
     * 小说内容分割
     * @param lines_new
     * @return
     */
    private List<NovelInfo> processNovelInfo(List<String> lines_new,String novelName) {
        // 处理每个章节并将内容存储在NovelInfo对象中
        List<NovelInfo> infos = new ArrayList<>();
        Pattern pattern = Pattern.compile(chapterPattern);
        StringBuilder nowString = new StringBuilder();
        boolean startSpeek = false;
        boolean startGame = false;
        boolean startDian = true;
        String dian = "，。？！；：...】";
        String actor = "旁白";
        int index = 0;
        int chapter = 0;
        // 遍历输出
        for (String line : lines_new) {
            Matcher matcher = pattern.matcher(line);
            if (matcher.matches()) {
                // 匹配成功：是章节行
                // 可选：提取章节号和章节名称
                String chapterNum = line.replaceAll("第(\\d+)章.*", "$1");// 章节号
                chapter = Integer.parseInt(chapterNum);
                if (!nowString.isEmpty()) {
                    NovelInfo info=new NovelInfo();
                    info.setNovelName(novelName);
                    info.setEmotion("general");//普通
                    info.setTone("0");//语调
                    info.setSpeechRate(1.0);//语速
                    info.setVolume("5");
                    info.setChapterNum(chapter - 1);
                    info.setContent(nowString.toString().replace("'", "''"));
                    info.setIndex(index);
                    info.setActorName(actor);//角色
                    infos.add(info);
                }
                actor = "旁白";
                nowString = new StringBuilder();
                startSpeek = false;
                startGame = false;
                index = 0;
                NovelInfo info_title=new NovelInfo();
                info_title.setNovelName(novelName);
                info_title.setEmotion("general");//普通
                info_title.setTone("0");//语调
                info_title.setSpeechRate(1.0);//语速
                info_title.setVolume("5");
                info_title.setChapterNum(chapter);
                info_title.setContent(line.replace("'", "''"));
                info_title.setIndex(index);
                info_title.setActorName(actor);//角色
                infos.add(info_title);
                index++;
            } else {
                // 匹配失败：不是章节行（可根据需求省略此输出）
                for (int i = 0; i < line.length(); i++) {
                    char nowKey = line.charAt(i);
                    if (nowKey == '“') {
                        if (!startSpeek) {
                            if (!nowString.isEmpty()) {
                                NovelInfo info=new NovelInfo();
                                info.setNovelName(novelName);
                                info.setEmotion("general");//普通
                                info.setTone("0");//语调
                                info.setSpeechRate(1.0);//语速
                                info.setVolume("5");
                                info.setChapterNum(chapter);
                                info.setContent(nowString.toString().replace("'", "''"));
                                info.setIndex(index);
                                info.setActorName(actor);//角色
                                infos.add(info);
                                index++;
                            }
                            nowString = new StringBuilder();
                            startSpeek = true;
                            actor = "";
                        }
                        nowString.append(nowKey);
                    } else if (nowKey == '”') {
                        nowString.append(nowKey);
                        startSpeek = false;
                        if (!nowString.isEmpty()) {
                            NovelInfo info=new NovelInfo();
                            info.setNovelName(novelName);
                            info.setEmotion("general");//普通
                            info.setTone("0");//语调
                            info.setSpeechRate(1.0);//语速
                            info.setVolume("5");
                            info.setChapterNum(chapter);
                            info.setContent(nowString.toString().replace("'", "''"));
                            info.setIndex(index);
                            info.setActorName(actor);//角色
                            infos.add(info);
                            index++;
                        }
                        actor = "旁白";
                        nowString = new StringBuilder();
                    } else if (nowKey == '【' && !startSpeek) {
                        if (!nowString.isEmpty()) {
                            char oldKey = line.charAt(i - 1);
                            if (oldKey!='】'|| !startGame) {
                                NovelInfo info=new NovelInfo();
                                info.setNovelName(novelName);
                                info.setEmotion("general");//普通
                                info.setTone("0");//语调
                                info.setSpeechRate(1.0);//语速
                                info.setVolume("5");
                                info.setChapterNum(chapter);
                                info.setContent(nowString.toString().replace("'", "''"));
                                info.setIndex(index);
                                info.setActorName(actor);//角色
                                infos.add(info);
                                index++;
                                nowString = new StringBuilder();
                            }
                        }
                        startGame = true;
                        actor = "游廊";
                        nowString.append(nowKey);
                    } else if (nowKey == '】' && !startSpeek) {
                        nowString.append(nowKey);
                        if(i + 1<line.length()) {
                            char nextKey = line.charAt(i + 1);
                            if (nextKey == '【') {
                                continue;
                            }
                        }
                        NovelInfo info=new NovelInfo();
                        info.setNovelName(novelName);
                        info.setEmotion("general");//普通
                        info.setTone("0");//语调
                        info.setSpeechRate(1.0);//语速
                        info.setVolume("5");
                        info.setChapterNum(chapter);
                        info.setContent(nowString.toString().replace("'", "''"));
                        info.setIndex(index);
                        info.setActorName(actor);//角色
                        infos.add(info);
                        index++;
                        startGame = false;
                        actor = "旁白";
                        nowString = new StringBuilder();
                    } else {
                        if (!Character.isSpaceChar(nowKey)) {
                            nowString.append(nowKey);
                        }
                    }
                }
            }
        }
        return infos;
//        String fileName = content.split("\n")[0];
//        // 移除《》符号
//        String novelName = fileName.replaceAll("[《》]", "");
//
//        // 替换换行符和全角空格
//        content=content.replaceAll("\n","");
//        content=content.replaceAll("\t","");
//        content=content.replaceAll("　","");
//        // 编译匹配"第X章"的正则表达式（正向预查）
//        Pattern splitPattern = Pattern.compile("(?=第[一二三四五六七八九十百千0-9]+章)");
//        String[] splitParts = splitPattern.split(content);
//
//        // 过滤空部分并转换为List
//        List<String> parts = new ArrayList<>();
//        for (String part : splitParts) {
//            if (part.trim().length() > 0) {
//                parts.add(part);
//            }
//        }
//
//        // 移除书名信息（移除第一个元素）
//        if (!parts.isEmpty()) {
//            parts.remove(0);
//        }
//
//        // 分割章节信息
//        Pattern chapterPattern = Pattern.compile("第[一二三四五六七八九十百千0-9]+章");
//        List<String> chapters = new ArrayList<>();
//        for (int i = 0; i < parts.size(); i++) {
//            String section = parts.get(i);
//            Matcher matcher = chapterPattern.matcher(section);
//            // 移除章节标题
//            String chapter = matcher.replaceFirst("").trim();
//            chapters.add(chapter);
//        }
//        //获取当前书的语音信息
//        List<CharacterVoice> characterVoices = characterVoiceService.findCharacterVoiceByCond(novelName,null,null);
//        HashMap<String, String> characterVoiceMap = new HashMap<>();
//        for (CharacterVoice characterVoice : characterVoices) {
//            characterVoiceMap.put(characterVoice.getActor(), characterVoice.getVoice());
//        }
//
//        // 处理每个章节并将内容存储在NovelInfo对象中
//        List<NovelInfo> infos = new ArrayList<>();
//        for (int j = 0; j < chapters.size(); j++) {
//            // 移除换行、制表符和全角空格
//            String text = chapters.get(j).replaceAll("\n", "").replaceAll("\t", "").replaceAll("　", "").replaceAll("\r", "");
//            StringBuilder newtxt = new StringBuilder();
//            int index = 0;
//            // 标点符号集合（对应原JS的perPorts）
//            String perPorts = "，。？！";
//            boolean talkStart = false; // 角色对话标记（“”之间）
//            boolean ylStart = false; // 游廊标记（【】之间）
//            int lineIndex = 1;
//            for (int i = 0; i < text.length(); i++) {
//                char c = text.charAt(i);
//                if (c == '“') {
//                    talkStart = true;
//                    continue;
//                } else if (c == '”' && talkStart) { // 处理角色对话结束符“”
//                    index = 0;
//                    NovelInfo info = new NovelInfo();
//                    info.setChapterNum(j + 1);
//                    info.setEmotion("general");//普通
//                    info.setTone("0");//语调
//                    info.setSpeechRate(1.0);//语速
//                    info.setVolume("5");
//                    info.setNovelName(novelName);
//                    info.setContent(newtxt.toString());
//                    info.setIndex(lineIndex);
//                    lineIndex++;
//                    info.setActor(characterVoiceMap.get("角色"));//角色
//                    infos.add(info);
//                    newtxt = new StringBuilder();
//                    talkStart = false;
//                } else if (c == '【') { // 处理游廊开始符【
//                    ylStart = true;
//                } else if (c == '】' && ylStart) {
//                    index = 0;
//                    NovelInfo info = new NovelInfo();
//                    info.setEmotion("assistant");// 智能助手
//                    info.setTone("-35");//语调
//                    info.setSpeechRate(1.0);//语速
//                    info.setVolume("5");
//                    info.setChapterNum(j + 1);
//                    info.setNovelName(novelName);
//                    info.setContent(newtxt.toString());
//                    info.setIndex(lineIndex);
//                    lineIndex++;
//                    info.setActor(characterVoiceMap.get("游廊"));//游廊
//                    infos.add(info);
//                    newtxt = new StringBuilder();
//                    ylStart = false;
//                } else if (perPorts.indexOf(c) != -1) { // 处理标点符号
//                    newtxt.append(c);
//                    // 非对话状态且索引>=12，重置索引
//                    if (!ylStart && !talkStart && index >= 12) {
//                        index = 0;
//                        NovelInfo info = new NovelInfo();
//                        info.setEmotion("general");//普通
//                        info.setTone("0");//语调
//                        info.setSpeechRate(1.0);//语速
//                        info.setVolume("5");
//                        info.setChapterNum(j + 1);
//                        info.setNovelName(novelName);
//                        info.setContent(newtxt.toString());
//                        info.setIndex(lineIndex);
//                        lineIndex++;
//                        info.setActor(characterVoiceMap.get("旁白"));//旁白
//                        infos.add(info);
//                        newtxt = new StringBuilder();
//                    }
//                } else { // 普通字符处理
//                    newtxt.append(c);
//                    index++;
//                }
//            }
//        }
//        return infos;
    }

    @RequestMapping("updateNovelInfo")
    public Result updateNovelInfo(int id, String novelName, String novelVoiceUrl,String  content,String  actorVoice,String  actorName,String  emotion,String  tone,Double speechRate,String  volume) {
        NovelInfo novelInfo = novelInfoService.findNovelInfoById(id);
        novelInfo.setNovelName(novelName);
        novelInfo.setNovelVoiceUrl(novelVoiceUrl);
        novelInfo.setContent(content);
        novelInfo.setActorVoice(actorVoice);
        novelInfo.setActorName(actorName);
        novelInfo.setEmotion(emotion);
        novelInfo.setTone(tone);
        novelInfo.setSpeechRate(speechRate);
//        novelInfo.setVolume(volume);
        novelInfoService.updateNovelInfo(novelInfo);
        log.info("修改成功");
        return Result.success(novelInfo);
    }

    @RequestMapping("generateAudio")
    public Result generateAudio(String content, String actor, String emotion, String tone, Double speechRate, String volume,Integer chapterNum, Integer index, String novelName) {
        String filePath = FileUtil.TEXT_TO_AUDIO(content,actor,speechRate.intValue(),tone,emotion,chapterNum,index);
        return Result.success(filePath);
    }

    @RequestMapping("updateNovelAudio")
    public Result updateNovelAudio(String novelName) {
        List<NovelInfo> list_novelInfo =novelInfoService.findNovelInfoByNoAudio(novelName);
        log.info("开始处理无音频的章节");
        log.info("无音频的章节数量为："+list_novelInfo.size());
        for(NovelInfo novelInfo:list_novelInfo){
            String filePath = FileUtil.TEXT_TO_AUDIO(novelInfo.getContent(),novelInfo.getActorVoice(),novelInfo.getSpeechRate().intValue(),novelInfo.getTone(),novelInfo.getEmotion(),novelInfo.getChapterNum(),novelInfo.getIndex());
            novelInfo.setNovelVoiceUrl(filePath);
            novelInfoService.updateNovelInfo(novelInfo);
        }
        log.info("处理完成");
        return Result.success(list_novelInfo.size());
    }
}
