package com.epam.rd.autocode.spring.project.repo;

import com.epam.rd.autocode.spring.project.model.LogRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository extends JpaRepository<LogRecord, Long> {
}