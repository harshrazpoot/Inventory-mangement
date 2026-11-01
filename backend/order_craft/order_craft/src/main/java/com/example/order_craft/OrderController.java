package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private InventoryRepository inventoryRepo;

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    @PostMapping("/add")
    public Order createOrder(@RequestBody Order order) {
        // 1. Inventory se product dhundho aur uska price nikalo
        Inventory item = inventoryRepo.findByMaterialName(order.getProductName());
        double itemPrice = (item != null && item.getPrice() != null) ? item.getPrice() : 0.0;

        // Order mein price save karo (Optional but good practice)
        order.setPrice(itemPrice);
        Order savedOrder = orderRepo.save(order);

        // 2. Invoice Generate karo (Automatic amount calculation)
        Invoice invoice = new Invoice();
        invoice.setCustomerName(savedOrder.getCustomerName());
        invoice.setOrderId(savedOrder.getId()); // Order aur Invoice ko link kar diya!
        invoice.setTotalAmount((double) (savedOrder.getQuantity() * itemPrice));
        invoice.setPaymentStatus("Pending");
        invoiceRepo.save(invoice);

        // 3. Inventory se Stock minus karo
        if (item != null) {
            int remainingStock = item.getStockQty() - savedOrder.getQuantity();
            item.setStockQty(remainingStock);
            if (remainingStock < 10) {
                item.setStatus("Low Stock");
            } else {
                item.setStatus("In Stock");
            }
            inventoryRepo.save(item);
        }

        return savedOrder;
    }

    @PutMapping("/update-status/{id}")
    public String updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderRepo.findById(id).orElse(null);
        if (order != null) {

            // NAYA LOGIC: Agar Deliver kar rahe ho, toh check karo Bill Paid hai ya nahi!
            if ("Delivered".equalsIgnoreCase(status)) {
                Invoice invoice = invoiceRepo.findByOrderId(id);
                if (invoice != null && !"Paid".equalsIgnoreCase(invoice.getPaymentStatus())) {
                    return "PAYMENT_PENDING"; // Payment nahi aayi, toh rok do!
                }
            }

            order.setStatus(status);
            orderRepo.save(order);
            return "SUCCESS";
        }
        return "FAILED";
    }
}