package com.elitegames.repository;

import com.elitegames.entity.Order;
import com.elitegames.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByClientId(Long clientId);

    List<Order> findByServiceSellerId(Long sellerId);

    List<Order> findByServiceIdAndStatus(Long serviceId, OrderStatus status);

    List<Order> findByClientIdAndStatus(Long clientId, OrderStatus status);

    List<Order> findByStatus(OrderStatus status);
}