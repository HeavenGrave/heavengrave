package web.sn.dream.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.sn.dream.mapper.CharacterVoiceMapper;
import web.sn.dream.pojo.CharacterVoice;
import web.sn.dream.service.CharacterVoiceService;

import java.util.List;

@Slf4j
@Service
public class CharacterVoiceServiceImpl implements CharacterVoiceService {
    @Autowired
    private CharacterVoiceMapper characterVoiceMapper;

    public Integer insertCharacterVoice(CharacterVoice characterVoice) {
        return characterVoiceMapper.insertCharacterVoice(characterVoice);
    }

    public void updateCharacterVoice(CharacterVoice characterVoice) {
        characterVoiceMapper.updateCharacterVoice(characterVoice);
    }

    public CharacterVoice findCharacterVoiceById(int id) {
        return characterVoiceMapper.findCharacterVoiceById( id);
    }

    public void deleteCharacterVoiceById(int id) {
        characterVoiceMapper.deleteCharacterVoiceById(id);
    }

    public List<CharacterVoice> findAllCharacterVoice() {
        return characterVoiceMapper.findAllCharacterVoice();
    }

    public void deleteAllData() {
        characterVoiceMapper.deleteAllData();
    }

    public List<CharacterVoice> findCharacterVoiceByCond(String book,String actor,String gender) {
        return characterVoiceMapper.findCharacterVoiceByCond(book,actor,gender);
    }
    public List<CharacterVoice> findVoiceInfoByCondToPage(String novelName, String gender, String actor, String emotion, int pageNum, int pageSize) {
        int startNum = (pageNum-1)*pageSize;
        return characterVoiceMapper.findVoiceInfoByCondToPage(novelName,gender,actor,emotion,startNum,pageSize);
    }

    public int findVoiceInfoByCondCount(String novelName, String gender, String actor, String emotion) {
        return characterVoiceMapper.findVoiceInfoByCondCount(novelName,gender,actor,emotion);
    }
}
