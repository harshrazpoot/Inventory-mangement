package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderRepository poRepo;

    @GetMapping("/all")
    public List<PurchaseOrder> getAllPOs() {
        return poRepo.findAll();
    }

    @PostMapping("/add")
    public PurchaseOrder createPO(@RequestBody PurchaseOrder po) {
        po.setPoStatus("Ordered");
        return poRepo.save(po);
    }

    @DeleteMapping("/delete/{id}")
    public String deletePO(@PathVariable Long id) {
        poRepo.deleteById(id);
        return "Purchase Order deleted successfully!";
    }
}