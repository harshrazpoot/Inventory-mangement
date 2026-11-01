package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepo;

    @GetMapping("/all")
    public List<Invoice> getAllInvoices() {
        return invoiceRepo.findAll();
    }

    @PostMapping("/generate")
    public Invoice generateInvoice(@RequestBody Invoice invoice) {
        invoice.setPaymentStatus("Pending");
        return invoiceRepo.save(invoice);
    }

//    // YEH METHOD HONA ZAROORI HAI PAYMENT UPDATE KE LIYE
//    @PutMapping("/update-status/{id}")
//    public Invoice updatePaymentStatus(@PathVariable Long id) {
//        Invoice invoice = invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
//        invoice.setPaymentStatus("Paid");
//        return invoiceRepo.save(invoice);
//    }
    @PutMapping("/update-status/{id}")
    public Invoice updatePaymentStatus(@PathVariable Long id) {
        // Yahan ab hum apni custom exception use kar rahe hain
        Invoice invoice = invoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        invoice.setPaymentStatus("Paid");
        return invoiceRepo.save(invoice);
    }
}