package web.sn.dream.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WelcomeController {

    @GetMapping("/")
    public String index() {
        return "login";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/showEdit")
    public String showEdit() {
        return "showEdit";
    }

    @GetMapping("/myEdit")
    public String openMyEditPage() {
        return "myEdit";
    }

    //    @GetMapping("/daosan")
//    public String DaoSan(){
//        return "daosan";
//    }
    @GetMapping("/majiang")
    public String majiang() {
        return "majiang";
    }

    @GetMapping("/myPage")
    public String myPage() {
        return "myPage";
    }

    @GetMapping("/colorSort")
    public String colorSortPage() {
        return "colorSort";
    }

    @GetMapping("/treasureHunt")
    public String treasureHuntPage() {
        return "treasureHunt";
    }

    @GetMapping("/shuDu")
    public String shuDuPage() {
        return "shuDu";
    }

    @GetMapping("/saoLei")
    public String saoLeiPage() {
        return "saoLei";
    }

    @GetMapping("/myToDo")
    public String openMyToDoPage() {
        return "myToDo";
    }

    @GetMapping("/TexasPoker")
    public String openTexasPoker() {
        return "TexasPoker";
    }

    @GetMapping("/fileUpload")
    public String fileUpload() {
        return "fileUpload";
    }

}
