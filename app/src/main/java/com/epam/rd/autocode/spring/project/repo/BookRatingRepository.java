package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.BookRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRatingRepository extends JpaRepository<BookRating, Long> {
    Optional<BookRating> findByClient_EmailAndBook_Id(String email, Long bookId);
    Optional<BookRating> findByClient_IdAndBook_Id(Long clientId, Long bookId);

    @Query("SELECT AVG(r.rating) FROM BookRating r WHERE r.book.id = :bookId")
    Double getAverageRating(Long bookId);

    @Query("SELECT COUNT(r) FROM BookRating r WHERE r.book.id = :bookId")
    Integer countByBookId(Long bookId);
}