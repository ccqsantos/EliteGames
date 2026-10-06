package com.elitegames.service_tests;

import com.elitegames.entity.Product;
import com.elitegames.entity.Seller;
import com.elitegames.repository.ProductRepository;
import com.elitegames.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Seller sampleSeller() {
        return Seller.builder()
                .id(1L)
                .storeName("Elite Store")
                .storeSlug("elite-store")
                .build();
    }

    private Product sampleProduct(Long id) {
        return Product.builder()
                .id(id)
                .title("RTX 3060")
                .description("Placa de vídeo")
                .price(799.90)
                .category("Peripherals")
                .stock(40)
                .ordersCompleted(0)
                .averageRating(0D)
                .seller(sampleSeller())
                .images(List.of("https://example.com/img1.jpg"))
                .build();
    }

    // ---------- create ----------

    @Test
    @DisplayName("create: attaches seller, saves and returns saved product")
    void create_whenCalled_attachesSellerAndSaves() {
        Seller seller = sampleSeller();
        Product input = Product.builder()
                .title("RTX 3060")
                .description("Placa de vídeo")
                .price(799.90)
                .category("Peripherals")
                .stock(40)
                .images(List.of("https://example.com/img1.jpg"))
                .build();

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L); // simula ID gerado pelo banco
            return p;
        });

        Product result = productService.create(input, seller);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("RTX 3060", result.getTitle());
        assertEquals(799.90, result.getPrice());
        assertEquals(seller, result.getSeller());

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertEquals(seller, captor.getValue().getSeller());
    }

    // ---------- save ----------

    @Test
    @DisplayName("save: delegates to repository")
    void save_whenCalled_delegatesToRepository() {
        Product product = sampleProduct(1L);
        when(productRepository.save(product)).thenReturn(product);

        Product result = productService.save(product);

        assertSame(product, result);
        verify(productRepository).save(product);
    }

    // ---------- findAll ----------

    @Test
    @DisplayName("findAll: returns all products")
    void findAll_whenMultiple_returnsList() {
        Product p1 = Product.builder().id(1L).title("RTX 3060").build();
        Product p2 = Product.builder().id(2L).title("GTX 1660").build();
        when(productRepository.findAll()).thenReturn(List.of(p1, p2));

        List<Product> result = productService.findAll();

        assertEquals(2, result.size());
        assertEquals("RTX 3060", result.get(0).getTitle());
        verify(productRepository).findAll();
    }

    @Test
    @DisplayName("findAll: returns empty list when repository is empty")
    void findAll_whenEmpty_returnsEmptyList() {
        when(productRepository.findAll()).thenReturn(List.of());

        List<Product> result = productService.findAll();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ---------- getById ----------

    @Test
    @DisplayName("getById: returns product when it exists")
    void getById_whenExists_returnsProduct() {
        Product product = sampleProduct(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getById(1L);

        assertEquals("RTX 3060", result.getTitle());
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("getById: throws when product does not exist")
    void getById_whenMissing_throws() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> productService.getById(99L));

        assertEquals("Produto não encontrado.", ex.getMessage());
    }

    // ---------- delete ----------

    @Test
    @DisplayName("delete: calls repository.deleteById when product exists")
    void delete_whenExists_delegatesToRepository() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.delete(1L);

        verify(productRepository).existsById(1L);
        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("delete: throws when product does not exist")
    void delete_whenMissing_throws() {
        when(productRepository.existsById(99L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> productService.delete(99L));

        assertEquals("Produto não encontrado.", ex.getMessage());
        verify(productRepository, never()).deleteById(any());
    }

    // ---------- findBySellerId ----------

    @Test
    @DisplayName("findBySellerId: returns products for that seller")
    void findBySellerId_whenExists_returnsProducts() {
        Seller seller = sampleSeller();
        Product p1 = Product.builder().id(1L).seller(seller).title("RTX 3060").build();
        Product p2 = Product.builder().id(2L).seller(seller).title("GTX 1660").build();

        when(productRepository.findBySellerId(1L)).thenReturn(List.of(p1, p2));

        List<Product> result = productService.findBySellerId(1L);

        assertEquals(2, result.size());
        assertEquals("RTX 3060", result.get(0).getTitle());
        verify(productRepository).findBySellerId(1L);
    }

    @Test
    @DisplayName("findBySellerId: returns empty list when seller has no products")
    void findBySellerId_whenNone_returnsEmptyList() {
        when(productRepository.findBySellerId(99L)).thenReturn(List.of());

        List<Product> result = productService.findBySellerId(99L);

        assertTrue(result.isEmpty());
    }
}