package com.elitegames.entity;

public enum PaymentStatus {
    PENDING,     // Aguardando pagamento
    PAID,        // Pago
    REFUNDED,    // Reembolsado
    FAILED       // Falha no pagamento
}