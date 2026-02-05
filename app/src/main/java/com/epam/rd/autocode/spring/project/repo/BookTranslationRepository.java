package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookTranslationRepository extends JpaRepository<BookTranslation, Long> {

    Optional<BookTranslation> findByBookAndLocale(Book book, String locale);

    Optional<BookTranslation> findByBookIdAndLocale(Long bookId, String locale);

    Optional<BookTranslation> findByName(String name);

    List<BookTranslation> findAllByLocale(String locale);

    @Modifying
    @Transactional
    @Query("DELETE FROM BookTranslation t WHERE t.book.id = :bookId")
    void deleteByBookId(@org.springframework.data.repository.query.Param("bookId") Long bookId);
}
