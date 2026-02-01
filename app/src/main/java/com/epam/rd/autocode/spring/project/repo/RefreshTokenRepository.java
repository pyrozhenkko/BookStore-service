package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserEmail(String userEmail); // Для logout (видалення всіх сесій)
}