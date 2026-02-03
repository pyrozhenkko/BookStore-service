package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_comments")
@Getter
@Setter
@NoArgsConstructor
public class BookComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.EAGER) // Клієнта вантажимо, щоб показати ім'я
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false, length = 2000)
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public BookComment(Book book, Client client, String comment) {
        this.book = book;
        this.client = client;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }
}