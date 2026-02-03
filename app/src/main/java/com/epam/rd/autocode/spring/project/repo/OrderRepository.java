package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findAllByClient_Email(String email, Pageable pageable);
    Page<Order> findAllByEmployee_Email(String email, Pageable pageable);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.bookItems i WHERE o.client.id = :clientId AND i.book.id = :bookId")
    boolean existsByClientAndBook(Long clientId, Long bookId);
}