package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.CommentResponse;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookComment;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private BookRatingRepository ratingRepository;
    @Mock
    private BookCommentRepository commentRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Client client;
    private Book book;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setId(1L);
        client.setEmail("user@example.com");

        book = new Book();
        book.setId(1L);
        book.setName("Test Book");
        book.setAverageRating(0.0);
        book.setTotalReviews(0);

        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("user@example.com");
    }

    @Test
    void setRating_ValidValue_ShouldUpdateStats() {
        when(clientRepository.findByEmail("user@example.com")).thenReturn(Optional.of(client));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(ratingRepository.findByClient_EmailAndBook_Id("user@example.com", 1L)).thenReturn(Optional.empty());

        // Stats mocks
        when(ratingRepository.getAverageRating(1L)).thenReturn(4.0);
        when(ratingRepository.countByBookId(1L)).thenReturn(1);
        when(commentRepository.getAverageRating(1L)).thenReturn(5.0);
        when(commentRepository.countWithRating(1L)).thenReturn(1);

        reviewService.setRating(1L, 4);

        verify(ratingRepository).save(any());
        verify(bookRepository).save(book);
        assertEquals(4.5, book.getAverageRating()); // (4*1 + 5*1) / 2 = 4.5
        assertEquals(2, book.getTotalReviews());
    }

    @Test
    void setRating_InvalidValue_ShouldThrowException() {
        assertThrows(RuntimeException.class, () -> reviewService.setRating(1L, 6));
    }

    @Test
    void getComments_ShouldIncludeVerifiedStatus() {
        BookComment comment = new BookComment();
        comment.setClient(client);
        comment.setComment("Good");
        comment.setRating(5);

        when(commentRepository.findAllByBook_Id(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(comment)));
        when(orderRepository.existsByClientAndBook(1L, 1L)).thenReturn(true);

        Page<CommentResponse> result = reviewService.getComments(1L, Pageable.unpaged());

        assertNotNull(result);
        assertTrue(result.getContent().get(0).isVerifiedPurchase());
    }
}
