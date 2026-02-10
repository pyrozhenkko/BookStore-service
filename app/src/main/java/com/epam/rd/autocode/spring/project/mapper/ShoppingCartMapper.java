package com.epam.rd.autocode.spring.project.mapper;

import com.epam.rd.autocode.spring.project.dto.cart.CartItemDTO;
import com.epam.rd.autocode.spring.project.dto.cart.ShoppingCartDTO;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.CartItem;
import com.epam.rd.autocode.spring.project.model.ShoppingCart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ShoppingCartMapper {

    @Mapping(target = "totalPrice", expression = "java(cart.getTotalPrice())")
    ShoppingCartDTO toDto(ShoppingCart cart);

    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.name", target = "bookName")
    @Mapping(source = "book.isbn", target = "isbn")
    @Mapping(source = "book.price", target = "price")
    @Mapping(source = "book.author", target = "author")
    @Mapping(source = "book", target = "imageUrl", qualifiedByName = "mapFirstImage")
    CartItemDTO toItemDto(CartItem item);

    @Named("mapFirstImage")
    default String mapFirstImage(Book book) {
        if (book.getImageUrls() != null && !book.getImageUrls().isEmpty()) {
            return book.getImageUrls().get(0);
        }
        return null;
    }
}