package web.sn.dream;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import web.sn.dream.pojo.NovelInfo;
import web.sn.dream.service.CharacterVoiceService;
import web.sn.dream.service.NovelInfoService;
import web.sn.dream.utils.ExcelExporter;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@SpringBootTest
public class NovelTest {
    @Autowired
    private NovelInfoService novelInfoService;
    @Autowired
    private CharacterVoiceService characterVoiceService;

    //时间格式化工具
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmm");
    @Test
    public void TestText() {
        String filePath = "H:/baidudownload/sdmff1.txt";
        // 定义匹配"第xxx章xxxxx"的正则表达式
        // 规则说明：
        // 第：固定字符
        // \\d+：匹配1个或多个数字（章节号，比如1、10、100）
        // 章：固定字符
        // .*：匹配任意字符（章节名称，比如“绪论”、“Java IO操作”）
        // ^ 和 $：分别匹配行的开头和结尾（确保整行都是章节格式，可根据需求去掉）
        String chapterPattern = "^第\\d+章.*$";
        Pattern pattern = Pattern.compile(chapterPattern);

        StringBuilder nowString = new StringBuilder();
        boolean startSpeek = false;
        boolean startGame = false;
        boolean startDian = true;
        String dian = "，。？！；：...】";
        int index = 0;
        int chapter = 0;
        String actor = "旁白";
        String[] headers = {"id", "content", "chapter_num", "index", "actor_name"};
        String[] columnKeys = {"id", "content", "chapter_num", "index", "actor_name"};
        try {
            // 移除正文的非法字符
            List<String> lines_new = new ArrayList<String>();
            StringBuilder nowLineString = new StringBuilder();
            // 读取所有行到List<String>
            List<String> lines = Files.readAllLines(Paths.get(filePath));
            for (String line : lines) {
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
            // 示例使用返回字节数组的方法
            List<Map<String, Object>> excelDatas =new ArrayList<>();
            // 遍历输出
            for (String line : lines_new) {
                Map<String, Object> data;
                Matcher matcher = pattern.matcher(line);
                if (matcher.matches()) {
                    // 匹配成功：是章节行
                    // 可选：提取章节号和章节名称
                    String chapterNum = line.replaceAll("第(\\d+)章.*", "$1");// 章节号
                    chapter = Integer.parseInt(chapterNum);
                    if (!nowString.isEmpty()) {
                        data = Map.of("id", "", "content",nowString.toString() , "chapter_num",chapter - 1, "index", index,"actor_name", actor);
                        excelDatas.add(data);
                    }
                    actor = "旁白";
                    nowString = new StringBuilder();
                    startSpeek = false;
                    startGame = false;
                    index = 0;
                    data = Map.of("id", "", "content",line, "chapter_num",chapter, "index", index,"actor_name", actor);
                    excelDatas.add(data);
                    index++;
                } else {
                    // 匹配失败：不是章节行（可根据需求省略此输出）
                    for (int i = 0; i < line.length(); i++) {
                        char nowKey = line.charAt(i);
                        if (nowKey == '“') {
                            if (!startSpeek) {
                                    if (!nowString.isEmpty()) {
                                        data = Map.of("id", "", "content",nowString.toString() , "chapter_num",chapter, "index", index,"actor_name", actor);
                                        excelDatas.add(data);
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
                                data = Map.of("id", "", "content",nowString.toString() , "chapter_num",chapter, "index", index,"actor_name", actor);
                                excelDatas.add(data);
                                index++;
                            }
                            actor = "旁白";
                            nowString = new StringBuilder();
                        } else if (nowKey == '【' && !startSpeek) {
                            if (!nowString.isEmpty()) {
                                char oldKey = line.charAt(i - 1);
                                if (oldKey!='】'|| !startGame) {
                                    data = Map.of("id", "", "content",nowString.toString() , "chapter_num",chapter, "index", index,"actor_name", actor);
                                    excelDatas.add(data);
                                    index++;
                                    nowString = new StringBuilder();
                                }
                            }
                            startGame = true;
                            actor = "游廊";
                            nowString.append(nowKey);
                        } else if (nowKey == '】' && !startSpeek) {
                            nowString.append(nowKey);
                            if(i + 1<line.length()){
                                char nextKey = line.charAt(i + 1);
                                if (nextKey == '【') {
                                    continue;
                                }
                            }
                            data = Map.of("id", "", "content",nowString.toString() , "chapter_num",chapter, "index", index,"actor_name", actor);
                            excelDatas.add(data);
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
            // 获取Excel字节数组
            byte[] excelBytes = ExcelExporter.exportExcelToByteArray(excelDatas, headers, columnKeys, true);
            // 现在可以将字节数组保存到文件或传输到前端
            try (FileOutputStream fos = new FileOutputStream("output.xlsx")) {
                fos.write(excelBytes);
            }
            String targetFilePath = "H:/export_sdmff_"+sdf.format(new Date())+".xlsx";
            Files.write(Paths.get(targetFilePath), excelBytes);
            System.out.println("字节数组导出文件成功！文件路径：" + targetFilePath);
            System.out.println("Excel字节数组生成成功，大小: " + excelBytes.length + " 字节");
        } catch (IOException e) {
            System.err.println("读取文件时发生错误：" + e.getMessage());
        }
    }

    @Test
    public void novelMerge() {
        List<NovelInfo> info_new = new ArrayList<>();
        int startChapter = 1;
        int endChapter = 400;
        for (int i = startChapter; i <= endChapter; i++) {
            int index = 1;
            List<NovelInfo> infos_toNum = novelInfoService.findNovelInfoByNovelNameAndChapterNum("神的模仿犯", i);
            if(infos_toNum == null||infos_toNum.size() == 0){
                continue;
            }
            NovelInfo oldInfo = null;
            for (NovelInfo info : infos_toNum) {
                if(i>=145){
                    info_new.add(info);continue;
                }else {
                    if (info.getIndex() == 0) {
                        info_new.add(info);
                    } else if (info.getChapterNum() >= 47) {
                        info_new.add(info);
                        index++;
                    } else {
                        if (oldInfo == null) {
                            oldInfo = info;
                        } else {
                            if (oldInfo.getActorName().equals(info.getActorName())) {
                                oldInfo.setContent(oldInfo.getContent() + info.getContent());
                            } else {
                                oldInfo.setIndex(index);
                                index++;
                                info_new.add(oldInfo);
                                oldInfo = info;
                            }
                        }
                    }
                }
            }
        }
        novelInfoService.deleteNovelInfoByNovelName("神的模仿犯");
        novelInfoService.batchInsertNovelInfo(info_new);
    }

}
