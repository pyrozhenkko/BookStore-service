package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.*;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookComment;
import com.epam.rd.autocode.spring.project.model.BookRating;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl {

    private final BookRatingRepository ratingRepository;
    private final BookCommentRepository commentRepository;
    private final BookRepository bookRepository;
    private final ClientRepository clientRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public void setRating(Long bookId, Integer ratingValue) {
        if (ratingValue < 1 || ratingValue > 5) throw new RuntimeException("Rating must be 1-5");

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Client client = clientRepository.findByEmail(email).orElseThrow();
        Book book = bookRepository.findById(bookId).orElseThrow();

        Optional<BookRating> existingRating = ratingRepository.findByClient_EmailAndBook_Id(email, bookId);

        if (existingRating.isPresent()) {
            existingRating.get().setRating(ratingValue);
            existingRating.get().setUpdatedAt(LocalDateTime.now());
            ratingRepository.save(existingRating.get());
        } else {
            BookRating newRating = new BookRating(book, client, ratingValue);
            ratingRepository.save(newRating);
        }

        updateBookAverageStats(book);
    }

    @Transactional
    public void addComment(Long bookId, String text) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Client client = clientRepository.findByEmail(email).orElseThrow();
        Book book = bookRepository.findById(bookId).orElseThrow();

        BookComment comment = new BookComment(book, client, text);
        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(Long bookId, Pageable pageable) {
        return commentRepository.findAllByBook_Id(bookId, pageable)
                .map(comment -> {
                    Long clientId = comment.getClient().getId();

                    Integer userRating = ratingRepository.findByClient_IdAndBook_Id(clientId, bookId)
                            .map(BookRating::getRating)
                            .orElse(null);

                    boolean isVerified = orderRepository.existsByClientAndBook(clientId, bookId);

                    return new CommentResponse(
                            comment.getId(),
                            comment.getClient().getName(),
                            comment.getComment(),
                            comment.getCreatedAt(),
                            userRating,
                            isVerified
                    );
                });
    }

    private void updateBookAverageStats(Book book) {
        Double avg = ratingRepository.getAverageRating(book.getId());
        Integer count = ratingRepository.countByBookId(book.getId());

        book.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        book.setTotalReviews(count != null ? count : 0);
        bookRepository.save(book);
    }
}