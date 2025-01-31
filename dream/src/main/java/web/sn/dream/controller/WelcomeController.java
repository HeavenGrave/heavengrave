package web.sn.dream.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WelcomeController {

    @GetMapping("/")
    public String index(){
        return "login";
    }
    @GetMapping("/login")
    public String login(){
        return "login";
    }

//    @GetMapping("/test")
//    public String test(){
//        return "test";
//    }

    @GetMapping("/showEdit")
    public String showEdit(){
        return "showEdit";
    }
//
//    @GetMapping("/myEdit")
//    public String openMyEditPage(){
//        return "myEdit";
//    }
//
//    @GetMapping("/daosan")
//    public String DaoSan(){
//        return "daosan";
//    }
//
    @GetMapping("/myPage")
    public String myPage(){
        return "myPage";
    }
//
//    @GetMapping("/treasureHunt")
//    public String treasureHuntPage(){
//        return "treasureHunt";
//    }
//
//    @GetMapping("/shuDu")
//    public String shuDuPage(){
//        return "shuDu";
//    }
//
//    @GetMapping("/saoLei")
//    public String saoLeiPage(){
//        return "saoLei";
//    }
//
//    @GetMapping("/myToDo")
//    public String openMyToDoPage(){
//        return "myToDo";
//    }

}
