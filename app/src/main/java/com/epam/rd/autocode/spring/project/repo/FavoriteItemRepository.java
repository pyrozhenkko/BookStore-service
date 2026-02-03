package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.FavoriteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteItemRepository extends JpaRepository<FavoriteItem, Long> {
    Optional<FavoriteItem> findByClient_EmailAndBook_Id(String email, Long bookId);
}