package com.elitegames.service;

import com.elitegames.entity.*;
import com.elitegames.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repository;
    private final FreelanceServiceService freelanceServiceService;

    @Transactional
    public Order create(FreelanceService freelanceService, User client) {
        Order order = Order.builder()
                .service(freelanceService)  // 🔧 Use .service() não .freelanceService()
                .client(client)
                .status(OrderStatus.PENDING)
                .totalAmount(freelanceService.getPrice())
                .expectedDelivery(LocalDateTime.now().plusDays(freelanceService.getDeliveryTimeDays()))
                .build();

        return repository.save(order);
    }

    public Order getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado."));
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = getById(orderId);
        validateStatusTransition(order.getStatus(), status, order);
        order.setStatus(status);

        if (status == OrderStatus.IN_PROGRESS && order.getStartedAt() == null) {
            order.setStartedAt(LocalDateTime.now());
        }

        if (status == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        if (status == OrderStatus.COMPLETED && order.getCompletedAt() == null) {
            order.setCompletedAt(LocalDateTime.now());
        }

        return repository.save(order);
    }

    @Transactional
    public Order deliverOrder(Long orderId, String message, String fileUrl) {
        Order order = getById(orderId);

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new RuntimeException("Este pedido não pode ser entregue. Status atual: " + order.getStatus());
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveryMessage(message);
        order.setDeliveryFileUrl(fileUrl);
        order.setDeliveredAt(LocalDateTime.now());

        return repository.save(order);
    }

    @Transactional
    public Order addClientReview(Long orderId, Integer rating, String comment) {
        Order order = getById(orderId);

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Apenas pedidos entregues podem ser avaliados. Status atual: " + order.getStatus());
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Avaliação deve ser entre 1 e 5 estrelas.");
        }

        order.setClientRating(rating);
        order.setClientReview(comment);
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        Order savedOrder = repository.save(order);

        // 🔧 Use getService() não getFreelanceService()
        updateServiceAverageRating(order.getService().getId());

        return savedOrder;
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getById(orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Apenas pedidos com status PENDING podem ser cancelados. Status atual: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELED);
        return repository.save(order);
    }

    public List<Order> findByClientId(Long clientId) {
        return repository.findByClientId(clientId);
    }

    public List<Order> findByFreelancerId(Long freelancerId) {
        return repository.findByServiceFreelancerId(freelancerId);
    }

    @Transactional
    public Order save(Order order) {
        return repository.save(order);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next, Order order) {
        if (current == OrderStatus.PENDING) {
            if (next != OrderStatus.IN_PROGRESS && next != OrderStatus.CANCELED) {
                throw new RuntimeException("Status inválido: De PENDING só pode ir para IN_PROGRESS ou CANCELLED");
            }
        }
        else if (current == OrderStatus.IN_PROGRESS) {
            if (next != OrderStatus.DELIVERED) {
                throw new RuntimeException("Status inválido: De IN_PROGRESS só pode ir para DELIVERED");
            }
        }
        else if (current == OrderStatus.DELIVERED) {
            if (next != OrderStatus.COMPLETED && next != OrderStatus.DISPUTED) {
                throw new RuntimeException("Status inválido: De DELIVERED só pode ir para COMPLETED ou DISPUTED");
            }
        }
        else if (current == OrderStatus.COMPLETED || current == OrderStatus.CANCELED) {
            throw new RuntimeException("Pedidos concluídos ou cancelados não podem ter status alterado");
        }
    }

    private void updateServiceAverageRating(Long serviceId) {
        List<Order> completedOrders = repository.findByServiceIdAndStatus(serviceId, OrderStatus.COMPLETED);

        if (completedOrders.isEmpty()) {
            return;
        }

        double average = completedOrders.stream()
                .filter(o -> o.getClientRating() != null)
                .mapToInt(Order::getClientRating)
                .average()
                .orElse(0.0);

        FreelanceService freelanceService = freelanceServiceService.getById(serviceId);
        freelanceService.setAverageRating(Math.round(average * 10) / 10.0);
        freelanceService.setOrdersCompleted(completedOrders.size());
        freelanceServiceService.save(freelanceService);
    }
}