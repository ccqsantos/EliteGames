//ProductServiceTests pra referencia:

package com.elitegames.service_tests;

import com.elitegames.entity.Product;
import com.elitegames.entity.Seller;
import com.elitegames.repository.ProductRepository;
import com.elitegames.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {
    @Mock
    private ProductRepository productRepository; //instancia da dependencia

    @InjectMocks
    private ProductService productService; //injetar a instancia na dep

    @Test
    @DisplayName("Should create product correctly")
    void create_correctly(){
        Seller seller = new Seller();
        List<String> images = List.of("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi8uBEKITlyqHsJ5f_N5V_ucNAuauwd8w2SNZLdlxIDyZCQ_DwTd2GejYP&s=10",
                "https://images.kabum.com.br/produtos/fotos/172233/placa-de-video-asus-tuf-rtx3060-o12g-v2-gaming-90yv0gc0-m0na10_1624968049_gg.jpg");
        Product product = Product.builder().id(1L)
                .title("RTX3060").description("Placa de video")
                .price(799.90).category("Peripherals")
                .stock(40).seller(seller).images(images)
                .ordersCompleted(0).averageRating(0D)
                .build();

        when(productRepository.save(product)).thenReturn(product);

        Product result = productService.create(product, seller);

        assertEquals("RTX3060", result.getTitle());
        assertEquals(799.90, result.getPrice());
    }

    @Test
    @DisplayName("Should overwrite/modify product correctly")
    void save_correctly(){
        Product product = Product.builder().id(1L)
                .title("RTX3060").description("Placa de video")
                .price(799.90).category("Peripherals")
                .stock(40).ordersCompleted(0).averageRating(0D)
                .build();

        when(productRepository.save(product)).thenReturn(product);

        Product result = productService.save(product);

        assertEquals("RTX3060", result.getTitle());
        assertEquals(799.90, result.getPrice());
    }

    @Test
    @DisplayName("Should return all products")
    void findAll_correctly(){
        Product p1 = Product.builder().id(1L).title("RTX3060").build();
        Product p2 = Product.builder().id(2L).title("GTX1660").build();
        when(productRepository.findAll()).thenReturn(List.of(p1, p2));

        List<Product> result = productService.findAll();

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should return product by ID")
    void getById_correctly(){
        Product product = Product.builder().id(1L).title("GTX3060").build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getById(1L);

        assertEquals("GTX3060", result.getTitle());
    }

//    @Test
 //   @DisplayName("Should delete correctly")
//    void delete_correctly(){
//        Long idExemplo = 1L;
//
//        productService.delete(idExemplo);
//
  //      verify(productRepository, times(1)).deleteById(idExemplo);
 //   }

    @Test
    @DisplayName("Should return seller by ID")
    void findBySellerId_IfExists_returnsProducts(){
        //inicializar as dependencias necessarias
        Seller seller = new Seller();
        seller.setId(1L);
        Product p1 = Product.builder().id(1L).seller(seller).title("GTX3060").build();
        Product p2 = Product.builder().id(2L).seller(seller).title("RTX3060").build();

        //testar se retorna
        when(productRepository.findBySellerId(seller.getId())).thenReturn(List.of(p1, p2));

        //usar o metodo/classe de fato
        List<Product> result = productService.findBySellerId(seller.getId());

        //confirmar se sao iguais: o resultado esperado e o obtido
        assertEquals(2, result.size());
        assertEquals("GTX3060", result.get(0).getTitle());
    }
}