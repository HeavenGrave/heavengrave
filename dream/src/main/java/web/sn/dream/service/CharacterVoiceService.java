package web.sn.dream.service;

import web.sn.dream.pojo.CharacterVoice;

import java.util.List;

public interface CharacterVoiceService {
    Integer insertCharacterVoice(CharacterVoice characterVoice);

    void  updateCharacterVoice(CharacterVoice characterVoice);

    CharacterVoice  findCharacterVoiceById(int id);

    void deleteCharacterVoiceById(int id);

    List<CharacterVoice> findAllCharacterVoice();

    void deleteAllData();

    List<CharacterVoice> findCharacterVoiceByCond(String book, String actor, String gender);

    int findVoiceInfoByCondCount(String novelName, String chapterNum, String actor, String emotion);

    List<CharacterVoice> findVoiceInfoByCondToPage(String novelName, String gender, String actor, String emotion, int pageNum, int pageSize);
}
