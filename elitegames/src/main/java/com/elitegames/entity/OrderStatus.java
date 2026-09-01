package com.elitegames.entity;

public enum OrderStatus {
    PENDING,        // Aguardando pagamento/confirmação
    IN_PROGRESS,    // Em andamento
    DELIVERED,      // Entregue (aguardando aprovação)
    COMPLETED,      // Concluído (aprovado)
    CANCELED,      // Cancelado
    DISPUTED,       // Em disputa (problema)
    REFUNDED
}
