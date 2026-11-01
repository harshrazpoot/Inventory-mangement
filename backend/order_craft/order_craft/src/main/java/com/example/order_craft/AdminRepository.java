package com.example.order_craft;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<admin, Long> {
    admin findByUsername(String username);
}