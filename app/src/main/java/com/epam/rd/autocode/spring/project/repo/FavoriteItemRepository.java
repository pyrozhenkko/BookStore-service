package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.FavoriteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface FavoriteItemRepository extends JpaRepository<FavoriteItem, Long> {
    Optional<FavoriteItem> findByClient_EmailAndBook_Id(String email, Long bookId);

    @Modifying
    @Transactional
    @Query("DELETE FROM FavoriteItem f WHERE f.book.id = :bookId")
    void deleteByBookId(@org.springframework.data.repository.query.Param("bookId") Long bookId);
}