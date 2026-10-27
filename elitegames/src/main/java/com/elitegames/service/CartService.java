package com.elitegames.service;

import com.elitegames.dto.CartItemResponse;
import com.elitegames.dto.CartResponse;
import com.elitegames.entity.*;
import com.elitegames.repository.CartItemRepository;
import com.elitegames.repository.CartRepository;
import com.elitegames.repository.ProductRepository;
import com.elitegames.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ---------- leitura ----------

    @Transactional(readOnly = true)
    public CartResponse getCart(Long customerId) {
        Cart cart = findOrCreateCart(customerId);
        // Recarrega com fetch para garantir itens + produto
        Cart loaded = cartRepository.findByCustomerIdWithItems(customerId)
                .orElse(cart);
        return toResponse(loaded);
    }

    // ---------- mutações ----------

    @Transactional
    public CartResponse addItem(Long customerId, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado."));

        if (product.getStock() == null || product.getStock() <= 0) {
            throw new RuntimeException("Produto sem estoque.");
        }

        // Impede o seller de comprar o próprio produto (mesma regra do OrderController)
        if (product.getSeller() != null
                && product.getSeller().getId() != null
                && product.getSeller().getId().equals(customerId)) {
            throw new RuntimeException("Você não pode adicionar seu próprio produto ao carrinho.");
        }

        Cart cart = findOrCreateCart(customerId);

        CartItem existing = cart.findItemByProductId(productId);
        int newQuantity = (existing != null ? existing.getQuantity() : 0) + quantity;

        if (newQuantity > product.getStock()) {
            throw new RuntimeException(
                    "Quantidade solicitada excede o estoque disponível (" + product.getStock() + ")."
            );
        }

        if (existing != null) {
            existing.setQuantity(newQuantity);
            existing.setUnitPriceSnapshot(BigDecimal.valueOf(product.getPrice()));   // atualiza snapshot
            existing.setProductNameSnapshot(product.getTitle());
            existing.setImageUrlSnapshot(firstImage(product));
        } else {
            CartItem item = new CartItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPriceSnapshot(BigDecimal.valueOf(product.getPrice()));
            item.setProductNameSnapshot(product.getTitle());
            item.setImageUrlSnapshot(firstImage(product));
            item.setStoreId(product.getSeller() != null ? product.getSeller().getId() : null);
            cart.addItem(item);
        }

        cartRepository.save(cart);
        return toResponse(cartRepository.findByCustomerIdWithItems(customerId).orElse(cart));
    }

    @Transactional
    public CartResponse updateQuantity(Long customerId, Long productId, int quantity) {
        if (quantity <= 0) {
            // quantity == 0 é atalho para remover
            return removeItem(customerId, productId);
        }

        Cart cart = findOrCreateCart(customerId);
        CartItem item = cart.findItemByProductId(productId);
        if (item == null) {
            throw new RuntimeException("Item não está no carrinho.");
        }

        Product product = item.getProduct();
        if (quantity > product.getStock()) {
            throw new RuntimeException(
                    "Quantidade solicitada excede o estoque disponível (" + product.getStock() + ")."
            );
        }

        item.setQuantity(quantity);
        cartRepository.save(cart);
        return toResponse(cartRepository.findByCustomerIdWithItems(customerId).orElse(cart));
    }

    @Transactional
    public CartResponse removeItem(Long customerId, Long productId) {
        Cart cart = findOrCreateCart(customerId);
        CartItem item = cart.findItemByProductId(productId);
        if (item != null) {
            cart.removeItem(item);
            cartRepository.save(cart);
        }
        return toResponse(cartRepository.findByCustomerIdWithItems(customerId).orElse(cart));
    }

    @Transactional
    public CartResponse clear(Long customerId) {
        Cart cart = findOrCreateCart(customerId);
        cart.getItems().clear();
        cartRepository.save(cart);
        return toResponse(cart);
    }

    // ---------- helpers ----------

    private Cart findOrCreateCart(Long customerId) {
        return cartRepository.findByCustomerId(customerId).orElseGet(() -> {
            User user = userRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
            if (!(user instanceof Customer customer)) {
                throw new RuntimeException("Apenas clientes possuem carrinho.");
            }
            Cart cart = new Cart();
            cart.setCustomer(customer);
            return cartRepository.save(cart);
        });
    }

    private String firstImage(Product product) {
        List<String> images = product.getImages();
        return (images != null && !images.isEmpty()) ? images.get(0) : null;
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(i -> new CartItemResponse(
                        i.getProduct().getId(),
                        i.getStoreId(),
                        i.getQuantity(),
                        i.getUnitPriceSnapshot(),
                        i.getProductNameSnapshot(),
                        i.getImageUrlSnapshot(),
                        i.getAddedAt()
                ))
                .toList();

        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int itemCount = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return new CartResponse(
                cart.getCustomer().getId(),
                items,
                subtotal,
                itemCount,
                cart.getUpdatedAt()
        );
    }
}