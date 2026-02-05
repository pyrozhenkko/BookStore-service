package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "BOOK_TRANSLATIONS", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "book_id", "locale" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, length = 10)
    private String locale;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String characteristics;

    private String genre;
}
