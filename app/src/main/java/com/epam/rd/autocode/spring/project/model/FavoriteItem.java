package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_items")
@Getter
@Setter
@NoArgsConstructor
public class FavoriteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER) // Книгу вантажимо одразу, щоб показувати в списку
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "note")
    private String note;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    public FavoriteItem(Client client, Book book, String note) {
        this.client = client;
        this.book = book;
        this.note = note;
        this.addedAt = LocalDateTime.now();
    }
}