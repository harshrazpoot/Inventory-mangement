package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bom")
@CrossOrigin(origins = "*")
public class BOMController {

    @Autowired
    private BOMRepository bomRepo;

    @GetMapping("/all")
    public List<BOM> getAllBOMs() {
        return bomRepo.findAll();
    }

    @PostMapping("/add")
    public BOM addBOM(@RequestBody BOM bom) {
        return bomRepo.save(bom);
    }
}