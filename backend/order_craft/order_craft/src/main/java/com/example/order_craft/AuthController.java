package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AdminRepository adminRepo;

    @Autowired
    private JwtUtil jwtUtil;

    // Login API
    @PostMapping("/login")
    public String login(@RequestBody admin loginRequest) {
        admin dbAdmin = adminRepo.findByUsername(loginRequest.getUsername());
        if (dbAdmin != null && dbAdmin.getPassword().equals(loginRequest.getPassword())) {
            return jwtUtil.generateToken(dbAdmin.getUsername());
        }
        return "FAILED";
    }

    // NAYA: Forgot Password API
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody admin resetRequest) {
        admin dbAdmin = adminRepo.findByUsername(resetRequest.getUsername());
        if (dbAdmin != null) {
            // Naya password save kar do
            dbAdmin.setPassword(resetRequest.getPassword());
            adminRepo.save(dbAdmin);
            return "SUCCESS";
        }
        return "FAILED"; // Agar username database mein na ho
    }
}