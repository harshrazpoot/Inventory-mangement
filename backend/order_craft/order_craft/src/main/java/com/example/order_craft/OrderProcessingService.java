package com.example.order_craft;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class OrderProcessingService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private PurchaseOrderRepository poRepo;

    // @Transactional interview ka game-changer hai. Agar code line 38 par fail hua,
    // toh line 28 aur 32 ka data automatically database se rollback (delete) ho jayega.
    @Transactional(rollbackFor = Exception.class)
    public Order automateOrderWorkflow(Order order) {

        // 1. Save Order
        order.setStatus("Processing");
        Order savedOrder = orderRepo.save(order);

        // 2. Generate Invoice
        Invoice autoInvoice = new Invoice();
        autoInvoice.setOrderId(savedOrder.getId());
        autoInvoice.setCustomerName(savedOrder.getCustomerName());
        autoInvoice.setTotalAmount(savedOrder.getQuantity() * 1500.0);
        autoInvoice.setInvoiceDate(LocalDate.now().toString());
        autoInvoice.setPaymentStatus("Pending");
        invoiceRepo.save(autoInvoice);

        // 3. Generate BOM / Purchase Order
        PurchaseOrder autoPO = new PurchaseOrder();
        autoPO.setRawMaterialName("Components for: " + savedOrder.getProductName());
        autoPO.setQuantityRequired(savedOrder.getQuantity() * 3);
        autoPO.setSupplierName("Default Supplier");
        autoPO.setPoStatus("Ordered");
        poRepo.save(autoPO);

        return savedOrder;
    }
}