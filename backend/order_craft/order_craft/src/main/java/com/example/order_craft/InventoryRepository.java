package com.example.order_craft;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // NAYA LOGIC: Product ko uske naam se dhundhne ke liye
    Inventory findByMaterialName(String materialName);

}
