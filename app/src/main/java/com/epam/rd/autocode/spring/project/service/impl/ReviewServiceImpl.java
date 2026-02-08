package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.*;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookComment;
import com.epam.rd.autocode.spring.project.model.BookRating;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.exception.NotFoundException;
import com.epam.rd.autocode.spring.project.exception.ValidationException;
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
        if (ratingValue < 1 || ratingValue > 5)
            throw new ValidationException("Rating must be 1-5");

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Client not found"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new NotFoundException("Book not found"));

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
    public void addComment(Long bookId, String text, Integer rating) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Client not found"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new NotFoundException("Book not found"));

        BookComment comment = new BookComment(book, client, text, rating);
        commentRepository.save(comment);

        updateBookAverageStats(book);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(Long bookId, Pageable pageable) {
        return commentRepository.findAllByBook_Id(bookId, pageable)
                .map(comment -> {
                    Long clientId = comment.getClient().getId();

                    boolean isVerified = orderRepository.existsByClientAndBook(clientId, bookId);

                    return new CommentResponse(
                            comment.getId(),
                            comment.getClient().getName(),
                            comment.getComment(),
                            comment.getCreatedAt(),
                            comment.getRating(), // Тепер рейтинг береться напряму з коментаря
                            isVerified);
                });
    }

    private void updateBookAverageStats(Book book) {
        // Отримуємо статистику з явної таблиці рейтингів
        Double ratingAvg = ratingRepository.getAverageRating(book.getId());
        Integer ratingCount = ratingRepository.countByBookId(book.getId());

        // Отримуємо статистику з коментарів
        Double commentAvg = commentRepository.getAverageRating(book.getId());
        Integer commentCount = commentRepository.countWithRating(book.getId());

        double totalScore = 0;
        int totalCount = 0;

        if (ratingAvg != null && ratingCount != null && ratingCount > 0) {
            totalScore += ratingAvg * ratingCount;
            totalCount += ratingCount;
        }

        if (commentAvg != null && commentCount != null && commentCount > 0) {
            totalScore += commentAvg * commentCount;
            totalCount += commentCount;
        }

        double finalAvg = totalCount > 0 ? totalScore / totalCount : 0.0;

        book.setAverageRating(Math.round(finalAvg * 10.0) / 10.0);
        book.setTotalReviews(totalCount);
        bookRepository.save(book);
    }
}