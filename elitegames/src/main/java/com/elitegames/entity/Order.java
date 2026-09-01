package com.elitegames.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")  // Nome da tabela
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private FreelanceService service;  // 🔧 Nome do campo: service (não freelanceService)

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;  // ← Campo "client"

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    // 🔧 Campos de entrega
    @Column(name = "delivery_message", length = 2000)
    private String deliveryMessage;

    @Column(name = "delivery_file_url")
    private String deliveryFileUrl;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    // 🔧 Campos de avaliação do cliente
    @Column(name = "client_rating")
    private Integer clientRating;  // 1-5 estrelas

    @Column(name = "client_review", length = 1000)
    private String clientReview;   // Comentário do cliente

    // 🔧 Campos de avaliação do freelancer (para futuras implementações)
    @Column(name = "freelancer_rating")
    private Integer freelancerRating;  // 1-5 estrelas

    @Column(name = "freelancer_review", length = 1000)
    private String freelancerReview;   // Comentário do freelancer

    // 🔧 Valor total do pedido (pode ser diferente do preço do serviço)
    @Column(name = "total_amount")
    private Double totalAmount;

    // 🔧 Data de início e conclusão
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // 🔧 Data prevista de entrega (baseada no serviço + data do pedido)
    @Column(name = "expected_delivery")
    private LocalDateTime expectedDelivery;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Column(name = "payment_id")
    private String paymentId;

    @PreUpdate
    protected void onUpdate() {
        // Se o status mudou para IN_PROGRESS, registrar data de início
        if (status == OrderStatus.IN_PROGRESS && startedAt == null) {
            startedAt = LocalDateTime.now();
        }

        // Se o status mudou para COMPLETED, registrar data de conclusão
        if (status == OrderStatus.COMPLETED && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}