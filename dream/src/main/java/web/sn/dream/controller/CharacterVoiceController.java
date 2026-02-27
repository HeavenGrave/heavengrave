package web.sn.dream.controller;


import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web.sn.dream.mapper.MyToDoMapper;
import web.sn.dream.pojo.CharacterVoice;
import web.sn.dream.pojo.MyToDo;
import web.sn.dream.pojo.NovelInfo;
import web.sn.dream.pojo.Result;
import web.sn.dream.service.CharacterVoiceService;
import web.sn.dream.service.MaJiangService;
import web.sn.dream.utils.FileUtil;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("voice")
public class CharacterVoiceController {
    @Autowired
    private CharacterVoiceService characterVoiceService;

    @PostMapping("/addCharacterVoice")
    public Result addCharacterVoice(String book,String actor,String url,String gender,String des){
        CharacterVoice characterVoice = new CharacterVoice();
        characterVoice.setBook( book);
        characterVoice.setActor( actor);
        characterVoice.setUrl( url);
        characterVoice.setGender(gender);
        characterVoice.setVoice(des);
        characterVoice.setCreateTime(new Date());
        characterVoiceService.insertCharacterVoice(characterVoice);
        log.info("添加成功");
        //data 用于当前账户的信息处理
        return Result.success(characterVoice);
    }
    @GetMapping("/searchCharacterVoice")
    public Result searchCharacterVoice(String book,String actor,String gender){
        List<CharacterVoice> list_characterVoice ;
        // 调用业务对象的方法执行登录，并获取返回值
        list_characterVoice= characterVoiceService.findCharacterVoiceByCond(book,actor,gender);
        //data 用于当前账户的信息处理
        return Result.success(list_characterVoice);
}

@PostMapping("/updateCharacterVoice")
public Result updateCharacterVoice(int id,String text,String actor,String book,String voice,String emotion,String tone,double speechRate,String url) {
        CharacterVoice characterVoice = characterVoiceService.findCharacterVoiceById(id);
        characterVoice.setBook( book);
        characterVoice.setActor( actor);
        characterVoice.setUrl( url);
//        characterVoice.setGender("男");
        characterVoice.setVoice(voice);
        characterVoice.setTone(tone);
        characterVoice.setSpeechRate(speechRate);
//        characterVoice.setVolume();
        characterVoice.setEmotion(emotion);
        characterVoice.setText(text);
        characterVoice.setUpdateTime(new Date());
        characterVoiceService.updateCharacterVoice(characterVoice);
        log.info("更新成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }

    /**
     * 删除角色音频信息
     * @param id
     * @return
     */
    @PostMapping("/deleteCharacterVoice")
    public Result deleteCharacterVoice(int id) {
        characterVoiceService.deleteCharacterVoiceById(id);
        log.info("删除成功");
        //data 用于当前账户的信息处理
        return Result.success();
    }



    /**
     * 根据条件查询小说信息
     * @param novelName
     * @param pageNum
     * @param pageSize
     * @return
     */
    @GetMapping("/findVoiceInfoByCondToPage")
    public Result findVoiceInfoByCondToPage(String novelName, String gender, String actor, String emotion,int pageNum, int pageSize) {
        List<CharacterVoice> characterVoices = characterVoiceService.findVoiceInfoByCondToPage(novelName,gender,actor, emotion, pageNum, pageSize);
        int total = characterVoiceService.findVoiceInfoByCondCount(novelName,gender,actor, emotion);
        JSONObject json = new JSONObject();
        json.put("total", total);
        json.put("rows", characterVoices);
        return Result.success(json);
    }

    /**
     * 生成音频
     * @param content
     * @param actor
     * @param emotion
     * @param tone
     * @param speechRate
     * @param chapterNum
     * @param index
     * @return
     */
    @RequestMapping("generateAudio")
    public Result generateAudio(String content, String actor, String emotion, String tone, Double speechRate,Integer chapterNum, Integer index) {
        String filePath = FileUtil.TEXT_TO_AUDIO(content,actor,speechRate.intValue(),tone,emotion,chapterNum,index);
        return Result.success(filePath);
    }

    /**
     * 查询所有角色音频信息
     * @return
     */
    @GetMapping("/findAllVoiceInfo")
    public Result findAllVoiceInfo() {
        List<CharacterVoice> characterVoices = characterVoiceService.findAllCharacterVoice();
        return Result.success(characterVoices);
    }

}
