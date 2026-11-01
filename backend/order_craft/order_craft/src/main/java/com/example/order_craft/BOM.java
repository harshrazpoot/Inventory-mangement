package com.example.order_craft;

import jakarta.persistence.*;

@Entity
public class BOM {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productCode;
    private String productName;
    private String rawMaterialsRequired; // e.g., "Steel-2kg, Plastic-1kg"
    private double estimatedCost;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getRawMaterialsRequired() { return rawMaterialsRequired; }
    public void setRawMaterialsRequired(String rawMaterialsRequired) { this.rawMaterialsRequired = rawMaterialsRequired; }
    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }
}