package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.BookItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface BookItemRepository extends JpaRepository<BookItem, Long> {
    List<BookItem> findByBookId(Long bookId);

    boolean existsByBookId(Long bookId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BookItem b WHERE b.book.id = :bookId")
    void deleteByBookId(@org.springframework.data.repository.query.Param("bookId") Long bookId);
}
