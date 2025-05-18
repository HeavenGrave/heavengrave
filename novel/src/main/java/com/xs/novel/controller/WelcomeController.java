package com.xs.novel.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

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
    @GetMapping("/novel")
    public String showEdit(){
        return "novelIndex";
    }
}
