package com.elitegames.service_tests;

import com.elitegames.entity.*;
import com.elitegames.repository.OrderRepository;
import com.elitegames.service.OrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository; //instancia da dependencia

    @InjectMocks
    private OrderService orderService; //injetar a instancia na dep

    @Test
    @DisplayName("Should return order by ID")
    void getById_correctly(){
        Order order = Order.builder().id(1L).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Order result = orderService.getById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Should create order correctly")
    void create_correctly() {
        Seller seller = Seller.builder().id(1L).build();
        Product product = Product.builder()
                .id(1L)
                .title("RTX3060")
                .price(799.90)
                .seller(seller)
                .build();
        User client = User.builder().id(1L).name("Cauã").build();

        Order savedOrder = Order.builder()
                .id(1L)
                .service(product)
                .client(client)
                .status(OrderStatus.PENDING)
                .totalAmount(799.90)
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        Order result = orderService.create(product, client);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(Double.valueOf(799.90), result.getTotalAmount());
    }


    @Test
    @DisplayName("Should cancel the order if exists")
    void cancelOrder_ifOrderExists(){
        Order existing = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)   // começa PENDING
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.cancelOrder(1L);

        assertEquals(OrderStatus.CANCELED, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should update the order's status")
    void updateStatus_correctly() {
        Order existing = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.updateStatus(1L, OrderStatus.IN_PROGRESS);

        assertEquals(OrderStatus.IN_PROGRESS, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should add client review correctly")
    void addClientReview_correctly() {
        Seller seller = Seller.builder().id(1L).build();
        Product product = Product.builder()
                .id(1L)
                .title("RTX3060")
                .price(799.90)
                .seller(seller)
                .build();
        Order existing = Order.builder()
                .id(1L)
                .status(OrderStatus.DELIVERED)
                .service(product)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.addClientReview(1L, 4, "Otimo produto");

        assertEquals(4, result.getClientRating());
        assertEquals("Otimo produto", result.getClientReview());
        assertNotNull(result.getCompletedAt());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw when rating is out of range")
    void addClientReview_whenRatingInvalid_throws() {
        Seller seller = Seller.builder().id(1L).build();
        Product product = Product.builder()
                .id(1L)
                .title("RTX3060")
                .price(799.90)
                .seller(seller)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(
                Order.builder().id(1L).service(product).build()));

        assertThrows(IllegalArgumentException.class,
                () -> orderService.addClientReview(1L, 15, "Ruim"));

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return orders by Client ID")
    void findByClientId_IfExists_returnsOrders(){
        //inicializar as dependencias necessarias
        User client = new User();
        client.setId(1L);
        Order o1 = Order.builder().id(1L).client(client).build();
        Order o2 = Order.builder().id(2L).client(client).build();

        //testar se retorna
        when(orderRepository.findByClientId(client.getId())).thenReturn(List.of(o1, o2));

        //usar o metodo/classe de fato
        List<Order> result = orderService.findByClientId(client.getId());

        //confirmar se sao iguais: o resultado esperado e o obtido
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    @DisplayName("Should overwrite/modify order correctly")
    void save_correctly(){
        User client = new User();
        client.setId(1L);
        Order order = Order.builder().id(1L).client(client).build();

        when(orderRepository.save(order)).thenReturn(order);

        Order result = orderService.save(order);

        assertEquals(1L, result.getId());
        assertEquals(order.getClient(), result.getClient());
    }

    //    @Test //nao tem como acessar Order.builder().seller() X
    //    @DisplayName("Should return orders by sellers ID")
    //    void findBySellerUserId_IfExists_returnsOrders(){
    //       }

}
