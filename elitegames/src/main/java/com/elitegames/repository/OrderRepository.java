package com.elitegames.repository;

import com.elitegames.entity.Order;
import com.elitegames.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByClientId(Long clientId);

    // service.freelancer.id
    List<Order> findByServiceFreelancerId(Long freelancerId);

    // service.id
    List<Order> findByServiceIdAndStatus(Long serviceId, OrderStatus status);

    List<Order> findByClientIdAndStatus(Long clientId, OrderStatus status);

    List<Order> findByServiceFreelancerIdAndStatus(Long freelancerId, OrderStatus status);

    List<Order> findByStatus(OrderStatus status);
}