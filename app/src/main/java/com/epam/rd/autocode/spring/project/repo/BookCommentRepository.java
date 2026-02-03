package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.BookComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookCommentRepository extends JpaRepository<BookComment, Long> {
    Page<BookComment> findAllByBook_Id(Long bookId, Pageable pageable);
}