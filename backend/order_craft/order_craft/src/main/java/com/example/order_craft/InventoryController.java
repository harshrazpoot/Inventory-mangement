package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepo;

    // NAYA: Email Service yahan inject kar rahe hain
    @Autowired
    private EmailService emailService;

    @GetMapping("/all")
    public List<Inventory> getAllInventory() {
        return inventoryRepo.findAll();
    }

    @PostMapping("/add")
    public Inventory addOrUpdateInventory(@RequestBody Inventory inventory) {
        Inventory existingItem = inventoryRepo.findByMaterialName(inventory.getMaterialName());
        Inventory savedItem;

        if (existingItem != null) {
            int newStock = existingItem.getStockQty() + inventory.getStockQty();
            existingItem.setStockQty(newStock);
            existingItem.setPrice(inventory.getPrice());
            existingItem.setStatus(newStock < 10 ? "Low Stock" : "In Stock");

            savedItem = inventoryRepo.save(existingItem);
        } else {
            inventory.setStatus(inventory.getStockQty() < 10 ? "Low Stock" : "In Stock");
            savedItem = inventoryRepo.save(inventory);
        }

        // NAYA: Database mein save hone ke baad Admin ko Email bhejo!
        String subject = "🔔 OrderCraft Alert: Inventory Updated";
        String message = "Hello Admin,\n\nInventory has been successfully updated.\n\n" +
                "Item Name: " + savedItem.getMaterialName() + "\n" +
                "Total Stock Now: " + savedItem.getStockQty() + "\n" +
                "Current Price: $" + savedItem.getPrice() + "\n\n" +
                "Regards,\nOrderCraft ERP System";

        // Apna email yahan daalo jahan alert chahiye
        emailService.sendEmail("harshrajpoot2795@gmail.com", subject, message);

        return savedItem;
    }
}