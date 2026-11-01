package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepo;

    // NAYA: Invoice Repository ko connect kiya taaki status update kar sakein
    @Autowired
    private InvoiceRepository invoiceRepo;

    @GetMapping("/all")
    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    @PostMapping("/process")
    public String processPayment(@RequestBody Payment payment) {
        // 1. Pehle payment ki details save karo
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setStatus("Completed");
        paymentRepo.save(payment);

        // 2. NAYA LOGIC: Invoice ka status "Paid" karo
        Invoice invoice = invoiceRepo.findById(payment.getInvoiceId()).orElse(null);
        if (invoice != null) {
            invoice.setPaymentStatus("Paid");
            invoiceRepo.save(invoice);
        }

        return "SUCCESS";
    }
}