package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.BookComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface BookCommentRepository extends JpaRepository<BookComment, Long> {
    Page<BookComment> findAllByBook_Id(Long bookId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM BookComment c WHERE c.book.id = :bookId")
    void deleteByBookId(@org.springframework.data.repository.query.Param("bookId") Long bookId);

    @Query("SELECT AVG(c.rating) FROM BookComment c WHERE c.book.id = :bookId AND c.rating IS NOT NULL")
    Double getAverageRating(Long bookId);

    @Query("SELECT COUNT(c) FROM BookComment c WHERE c.book.id = :bookId AND c.rating IS NOT NULL")
    Integer countWithRating(Long bookId);
}