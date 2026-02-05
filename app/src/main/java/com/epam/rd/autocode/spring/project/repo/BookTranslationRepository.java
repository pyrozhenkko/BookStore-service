package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookTranslationRepository extends JpaRepository<BookTranslation, Long> {

    Optional<BookTranslation> findByBookAndLocale(Book book, String locale);

    Optional<BookTranslation> findByBookIdAndLocale(Long bookId, String locale);

    List<BookTranslation> findAllByLocale(String locale);

    void deleteByBook(Book book);
}
