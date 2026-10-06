package com.elitegames.service_tests;

import com.elitegames.entity.Order;
import com.elitegames.entity.OrderStatus;
import com.elitegames.entity.Product;
import com.elitegames.entity.Seller;
import com.elitegames.entity.User;
import com.elitegames.repository.OrderRepository;
import com.elitegames.service.OrderService;
import com.elitegames.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private OrderService orderService;

    private Product sampleProduct(Long id) {
        Product p = Product.builder()
                .id(id)
                .title("RTX 4090")
                .price(9999.90)
                .averageRating(0D)
                .ordersCompleted(0)
                .build();
        p.setSeller(Seller.builder().id(1L).build());
        return p;
    }

    private User sampleClient() {
        return User.builder().id(1L).name("Cauã").email("caua@elite.com").build();
    }

    private Order sampleOrder(Long id, OrderStatus status) {
        return Order.builder()
                .id(id)
                .service(sampleProduct(10L))
                .client(sampleClient())
                .status(status)
                .totalAmount(9999.90)
                .build();
    }

    // ---------- create ----------

    @Test
    @DisplayName("create: sets PENDING status and copies product price to total")
    void create_whenCalled_buildsPendingOrderWithProductPrice() {
        Product product = sampleProduct(10L);
        User client = sampleClient();

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.create(product, client);

        assertNotNull(result);
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(product, result.getService());
        assertEquals(client, result.getClient());
        assertEquals(9999.90, result.getTotalAmount());

        verify(orderRepository).save(any(Order.class));
    }

    // ---------- getById ----------

    @Test
    @DisplayName("getById: returns order when it exists")
    void getById_whenExists_returnsOrder() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Order result = orderService.getById(1L);

        assertEquals(1L, result.getId());
        assertEquals(OrderStatus.PENDING, result.getStatus());
    }

    @Test
    @DisplayName("getById: throws when order does not exist")
    void getById_whenMissing_throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.getById(99L));

        assertEquals("Pedido não encontrado.", ex.getMessage());
    }

    // ---------- updateStatus: transições válidas ----------

    @Test
    @DisplayName("updateStatus: PENDING -> IN_PROGRESS sets startedAt")
    void updateStatus_pendingToInProgress_setsStartedAt() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        Order result = orderService.updateStatus(1L, OrderStatus.IN_PROGRESS);

        assertEquals(OrderStatus.IN_PROGRESS, result.getStatus());
        assertNotNull(result.getStartedAt());
        assertTrue(result.getStartedAt().isAfter(before));
        assertNull(result.getDeliveredAt());
        assertNull(result.getCompletedAt());
    }

    @Test
    @DisplayName("updateStatus: PENDING -> CANCELED does not set timestamps")
    void updateStatus_pendingToCanceled_doesNotSetTimestamps() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.updateStatus(1L, OrderStatus.CANCELED);

        assertEquals(OrderStatus.CANCELED, result.getStatus());
        assertNull(result.getStartedAt());
        assertNull(result.getDeliveredAt());
        assertNull(result.getCompletedAt());
    }

    @Test
    @DisplayName("updateStatus: IN_PROGRESS -> DELIVERED sets deliveredAt")
    void updateStatus_inProgressToDelivered_setsDeliveredAt() {
        Order order = sampleOrder(1L, OrderStatus.IN_PROGRESS);
        order.setStartedAt(LocalDateTime.now().minusHours(1));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.updateStatus(1L, OrderStatus.DELIVERED);

        assertEquals(OrderStatus.DELIVERED, result.getStatus());
        assertNotNull(result.getDeliveredAt());
        assertNotNull(result.getStartedAt()); // preserva o anterior
    }

    @Test
    @DisplayName("updateStatus: DELIVERED -> COMPLETED sets completedAt")
    void updateStatus_deliveredToCompleted_setsCompletedAt() {
        Order order = sampleOrder(1L, OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now().minusHours(1));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.updateStatus(1L, OrderStatus.COMPLETED);

        assertEquals(OrderStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
        assertNotNull(result.getDeliveredAt());
    }

    @Test
    @DisplayName("updateStatus: DELIVERED -> DISPUTED is allowed")
    void updateStatus_deliveredToDisputed_isAllowed() {
        Order order = sampleOrder(1L, OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.updateStatus(1L, OrderStatus.DISPUTED);

        assertEquals(OrderStatus.DISPUTED, result.getStatus());
    }

    @Test
    @DisplayName("updateStatus: keeps startedAt if already set")
    void updateStatus_whenStartedAtAlreadySet_keepsIt() {
        LocalDateTime original = LocalDateTime.now().minusDays(1);
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        order.setStartedAt(original);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.updateStatus(1L, OrderStatus.IN_PROGRESS);

        assertEquals(original, result.getStartedAt());
    }

    // ---------- updateStatus: transições inválidas ----------

    @Test
    @DisplayName("updateStatus: PENDING -> DELIVERED is rejected")
    void updateStatus_pendingToDelivered_throws() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, OrderStatus.DELIVERED));

        assertTrue(ex.getMessage().contains("PENDING"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateStatus: IN_PROGRESS -> COMPLETED is rejected")
    void updateStatus_inProgressToCompleted_throws() {
        Order order = sampleOrder(1L, OrderStatus.IN_PROGRESS);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, OrderStatus.COMPLETED));

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateStatus: COMPLETED -> anything is rejected")
    void updateStatus_completedToAnything_throws() {
        Order order = sampleOrder(1L, OrderStatus.COMPLETED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, OrderStatus.DELIVERED));

        assertTrue(ex.getMessage().contains("concluídos ou cancelados"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateStatus: CANCELED -> anything is rejected")
    void updateStatus_canceledToAnything_throws() {
        Order order = sampleOrder(1L, OrderStatus.CANCELED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, OrderStatus.PENDING));

        verify(orderRepository, never()).save(any());
    }

    // ---------- addClientReview ----------

    @Test
    @DisplayName("addClientReview: valid rating on DELIVERED order completes it")
    void addClientReview_whenDeliveredAndValidRating_completesOrder() {
        Product product = sampleProduct(10L);
        Order order = Order.builder()
                .id(1L)
                .service(product)
                .client(sampleClient())
                .status(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByServiceIdAndStatus(10L, OrderStatus.COMPLETED))
                .thenReturn(List.of(order));
        when(productService.getById(10L)).thenReturn(product);

        Order result = orderService.addClientReview(1L, 5, "Excelente!");

        assertEquals(5, result.getClientRating());
        assertEquals("Excelente!", result.getClientReview());
        assertEquals(OrderStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());

        // verifica que a média do produto foi atualizada
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productService).save(captor.capture());
        assertEquals(5.0, captor.getValue().getAverageRating());
        assertEquals(1, captor.getValue().getOrdersCompleted());
    }

    @Test
    @DisplayName("addClientReview: throws when order is not DELIVERED")
    void addClientReview_whenNotDelivered_throws() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.addClientReview(1L, 5, "ok"));

        assertTrue(ex.getMessage().contains("entregues"));
        verify(orderRepository, never()).save(any());
        verify(productService, never()).save(any());
    }

    @Test
    @DisplayName("addClientReview: throws when rating is null")
    void addClientReview_whenRatingNull_throws() {
        Order order = sampleOrder(1L, OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.addClientReview(1L, null, "ok"));

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("addClientReview: throws when rating is below 1")
    void addClientReview_whenRatingTooLow_throws() {
        Order order = sampleOrder(1L, OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.addClientReview(1L, 0, "ruim"));

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("addClientReview: throws when rating is above 5")
    void addClientReview_whenRatingTooHigh_throws() {
        Order order = sampleOrder(1L, OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> orderService.addClientReview(1L, 6, "top"));

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("addClientReview: averages ratings across multiple completed orders")
    void addClientReview_whenMultipleOrders_averagesCorrectly() {
        Product product = sampleProduct(10L);

        Order o1 = Order.builder().id(1L).service(product).status(OrderStatus.COMPLETED).clientRating(5).build();
        Order o2 = Order.builder().id(2L).service(product).status(OrderStatus.COMPLETED).clientRating(4).build();
        Order o3 = Order.builder().id(3L).service(product).status(OrderStatus.COMPLETED).clientRating(3).build();

        Order target = Order.builder()
                .id(99L).service(product).status(OrderStatus.DELIVERED).build();

        when(orderRepository.findById(99L)).thenReturn(Optional.of(target));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByServiceIdAndStatus(10L, OrderStatus.COMPLETED))
                .thenReturn(List.of(o1, o2, o3));
        when(productService.getById(10L)).thenReturn(product);

        orderService.addClientReview(99L, 3, "ok");

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productService).save(captor.capture());
        // (5 + 4 + 3) / 3 = 4.0
        assertEquals(4.0, captor.getValue().getAverageRating());
        assertEquals(3, captor.getValue().getOrdersCompleted());
    }

    @Test
    @DisplayName("addClientReview: ignores null ratings when computing average")
    void addClientReview_ignoresNullRatingsInAverage() {
        Product product = sampleProduct(10L);

        Order rated = Order.builder().id(1L).service(product)
                .status(OrderStatus.COMPLETED).clientRating(4).build();
        Order unrated = Order.builder().id(2L).service(product)
                .status(OrderStatus.COMPLETED).clientRating(null).build();
        Order target = Order.builder().id(99L).service(product)
                .status(OrderStatus.DELIVERED).build();

        when(orderRepository.findById(99L)).thenReturn(Optional.of(target));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByServiceIdAndStatus(10L, OrderStatus.COMPLETED))
                .thenReturn(List.of(rated, unrated));
        when(productService.getById(10L)).thenReturn(product);

        orderService.addClientReview(99L, 4, "ok");

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productService).save(captor.capture());
        // só conta o 4 -> média 4.0, mas ordersCompleted = 2
        assertEquals(4.0, captor.getValue().getAverageRating());
        assertEquals(2, captor.getValue().getOrdersCompleted());
    }

    // ---------- cancelOrder ----------

    @Test
    @DisplayName("cancelOrder: PENDING order is canceled")
    void cancelOrder_whenPending_cancels() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.cancelOrder(1L);

        assertEquals(OrderStatus.CANCELED, result.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    @DisplayName("cancelOrder: IN_PROGRESS order cannot be canceled")
    void cancelOrder_whenInProgress_throws() {
        Order order = sampleOrder(1L, OrderStatus.IN_PROGRESS);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder(1L));

        assertTrue(ex.getMessage().contains("PENDING"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelOrder: DELIVERED order cannot be canceled")
    void cancelOrder_whenDelivered_throws() {
        Order order = sampleOrder(1L, OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class, () -> orderService.cancelOrder(1L));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelOrder: nonexistent order throws")
    void cancelOrder_whenMissing_throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.cancelOrder(99L));
        verify(orderRepository, never()).save(any());
    }

    // ---------- queries ----------

    @Test
    @DisplayName("findByClientId: returns orders for the client")
    void findByClientId_returnsOrders() {
        User client = sampleClient();
        Order o1 = Order.builder().id(1L).client(client).build();
        Order o2 = Order.builder().id(2L).client(client).build();
        when(orderRepository.findByClientId(1L)).thenReturn(List.of(o1, o2));

        List<Order> result = orderService.findByClientId(1L);

        assertEquals(2, result.size());
        verify(orderRepository).findByClientId(1L);
    }

    @Test
    @DisplayName("findBySellerUserId: returns orders for the seller")
    void findBySellerUserId_returnsOrders() {
        Order o1 = sampleOrder(1L, OrderStatus.PENDING);
        Order o2 = sampleOrder(2L, OrderStatus.COMPLETED);
        when(orderRepository.findByServiceSellerUserId(7L)).thenReturn(List.of(o1, o2));

        List<Order> result = orderService.findBySellerUserId(7L);

        assertEquals(2, result.size());
        verify(orderRepository).findByServiceSellerUserId(7L);
    }

    // ---------- save ----------

    @Test
    @DisplayName("save: delegates to repository")
    void save_delegatesToRepository() {
        Order order = sampleOrder(1L, OrderStatus.PENDING);
        when(orderRepository.save(order)).thenReturn(order);

        Order result = orderService.save(order);

        assertSame(order, result);
        verify(orderRepository).save(order);
    }
}