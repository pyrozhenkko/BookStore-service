package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_ratings")
@Getter
@Setter
@NoArgsConstructor
public class BookRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BookRating(Book book, Client client, Integer rating) {
        this.book = book;
        this.client = client;
        this.rating = rating;
        this.updatedAt = LocalDateTime.now();
    }
}