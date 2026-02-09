package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.mapper.BookMapper;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookTranslation;
import com.epam.rd.autocode.spring.project.model.enums.AgeGroup;
import com.epam.rd.autocode.spring.project.model.enums.Language;
import com.epam.rd.autocode.spring.project.exception.AlreadyExistException;
import com.epam.rd.autocode.spring.project.exception.InvalidOperationException;
import com.epam.rd.autocode.spring.project.exception.NotFoundException;
import com.epam.rd.autocode.spring.project.repo.*;
import com.epam.rd.autocode.spring.project.repo.specification.BookSpecification;
import com.epam.rd.autocode.spring.project.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final GoogleBooksService googleBooksService;
    private final FileStorageService fileStorageService;
    private final BookTranslationRepository bookTranslationRepository;
    private final CartItemRepository cartItemRepository;
    private final FavoriteItemRepository favoriteItemRepository;
    private final BookRatingRepository bookRatingRepository;
    private final BookCommentRepository bookCommentRepository;
    private final BookItemRepository bookItemRepository;

    private static final String DEFAULT_LOCALE = "en";

    @Override
    @Transactional(readOnly = true)
    public List<BookDTO> getAllBooks(String locale) {
        String effectiveLocale = normalizeLocale(locale);
        return bookRepository.findAll().stream()
                .map(book -> applyTranslation(bookMapper.toDto(book), book, effectiveLocale))
                .collect(Collectors.toList());
    }

    @Override
    public Page<BookDTO> searchBooks(String keyword, String genre, String stockStatus, BigDecimal minPrice,
            BigDecimal maxPrice, Language language, AgeGroup ageGroup,
            Pageable pageable, String locale) {
        String effectiveLocale = normalizeLocale(locale);
        Specification<Book> spec = Specification.where(BookSpecification.hasKeyword(keyword))
                .and(BookSpecification.hasGenre(genre))
                .and(BookSpecification.hasStockStatus(stockStatus))
                .and(BookSpecification.priceGreaterOrEqual(minPrice))
                .and(BookSpecification.priceLessOrEqual(maxPrice))
                .and(BookSpecification.hasLanguage(language))
                .and(BookSpecification.hasAgeGroup(ageGroup));

        return bookRepository
                .findAll(spec, pageable)
                .map(book -> applyTranslation(bookMapper.toDto(book), book, effectiveLocale));
    }

    @Override
    public BookDTO getBookByName(String name, String locale) {
        String effectiveLocale = normalizeLocale(locale);
        Book book = findBookByNameAnyLocale(name);

        enrichWithGoogleImagesIfNeeded(book);

        return applyTranslation(bookMapper.toDto(book), book, effectiveLocale);
    }

    @Transactional
    public BookDTO addImageToBook(String name, String imageUrl) {
        Book book = findBookByNameAnyLocale(name);

        book.getImageUrls().add(0, imageUrl);
        return bookMapper.toDto(bookRepository.save(book));
    }

    @Transactional
    public BookDTO removeImageFromBook(String name, String imageUrlToRemove) {
        Book book = findBookByNameAnyLocale(name);

        boolean removed = book.getImageUrls().remove(imageUrlToRemove);

        if (removed && imageUrlToRemove.startsWith("/uploads/")) {
            fileStorageService.deleteFile(imageUrlToRemove);
        }

        return bookMapper.toDto(bookRepository.save(book));
    }

    @Override
    public Integer getBookQuantity(String name) {
        return findBookByNameAnyLocale(name).getQuantity();
    }

    @Override
    @Transactional
    public BookDTO updateBookByName(String name, BookDTO bookDTO, String locale) {
        String effectiveLocale = normalizeLocale(locale);
        Book existingBook = findBookByNameAnyLocale(name);

        // Update global fields in the main Book entity
        existingBook.setAuthor(bookDTO.getAuthor());
        existingBook.setPrice(bookDTO.getPrice());
        existingBook.setQuantity(bookDTO.getQuantity());
        existingBook.setIsbn(bookDTO.getIsbn());
        existingBook.setPublicationDate(bookDTO.getPublicationDate());
        existingBook.setPages(bookDTO.getPages());
        existingBook.setLanguage(bookDTO.getLanguage());
        existingBook.setAgeGroup(bookDTO.getAgeGroup());

        if (bookDTO.getImageUrls() != null) {
            existingBook.getImageUrls().clear();
            existingBook.getImageUrls().addAll(bookDTO.getImageUrls());
        }

        if (DEFAULT_LOCALE.equals(effectiveLocale)) {
            // Update localized fields in the main table if locale is default (en)
            existingBook.setName(bookDTO.getName());
            existingBook.setGenre(bookDTO.getGenre());
            existingBook.setDescription(bookDTO.getDescription());
            existingBook.setCharacteristics(bookDTO.getCharacteristics());
        } else {
            // Update/Create translation if locale is non-default
            BookTranslation translation = bookTranslationRepository.findByBookAndLocale(existingBook, effectiveLocale)
                    .orElse(new BookTranslation());
            translation.setBook(existingBook);
            translation.setLocale(effectiveLocale);
            translation.setName(bookDTO.getName());
            translation.setDescription(bookDTO.getDescription());
            translation.setGenre(bookDTO.getGenre());
            translation.setCharacteristics(bookDTO.getCharacteristics());
            bookTranslationRepository.save(translation);
        }

        Book savedBook = bookRepository.save(existingBook);
        return applyTranslation(bookMapper.toDto(savedBook), savedBook, effectiveLocale);
    }

    @Override
    @Transactional
    public void deleteBookByName(String name) {
        Book book = findBookByNameAnyLocale(name);
        Long bookId = book.getId();

        if (bookItemRepository.existsByBookId(bookId)) {
            throw new InvalidOperationException("Cannot delete book that has been purchased");
        }

        // Delete uploaded physical files
        book.getImageUrls().forEach(url -> {
            if (url != null && url.startsWith("/uploads/")) {
                fileStorageService.deleteFile(url);
            }
        });

        // clean
        book.getImageUrls().clear();
        bookRepository.saveAndFlush(book);

        cartItemRepository.deleteByBookId(bookId);
        favoriteItemRepository.deleteByBookId(bookId);
        bookRatingRepository.deleteByBookId(bookId);
        bookCommentRepository.deleteByBookId(bookId);
        bookItemRepository.deleteByBookId(bookId);
        bookTranslationRepository.deleteByBookId(bookId);

        // Finally, delete the book itself
        bookRepository.delete(book);
    }

    private Book findBookByNameAnyLocale(String name) {
        Optional<Book> bookOpt = bookRepository.findByName(name);
        if (bookOpt.isPresent()) {
            return bookOpt.get();
        }

        return bookTranslationRepository.findByName(name)
                .map(BookTranslation::getBook)
                .orElseThrow(() -> new NotFoundException(
                        "Book not found: " + name));
    }

    @Override
    @Transactional
    public BookDTO addBook(BookDTO bookDTO) {
        if (bookRepository.findByName(bookDTO.getName()).isPresent())
            throw new AlreadyExistException("Book already exists");
        Book book = bookMapper.toEntity(bookDTO);
        if (book.getQuantity() == null)
            book.setQuantity(0);

        enrichWithGoogleImagesIfNeeded(book);

        return bookMapper.toDto(bookRepository.save(book));
    }

    @Override
    public List<String> getAllGenres(String locale) {
        String effectiveLocale = normalizeLocale(locale);
        if (DEFAULT_LOCALE.equals(effectiveLocale)) {
            return bookRepository.findAllGenres();
        }
        List<String> translatedGenres = bookTranslationRepository.findAllByLocale(effectiveLocale)
                .stream()
                .map(BookTranslation::getGenre)
                .filter(g -> g != null && !g.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        return translatedGenres.isEmpty() ? bookRepository.findAllGenres() : translatedGenres;
    }

    private void enrichWithGoogleImagesIfNeeded(Book book) {
        if (book.getImageUrls() == null || book.getImageUrls().isEmpty()) {
            List<String> googleImages = googleBooksService.findImagesByTitle(book.getName());
            if (!googleImages.isEmpty()) {
                if (book.getImageUrls() == null)
                    book.setImageUrls(new java.util.ArrayList<>());
                book.getImageUrls().addAll(googleImages);
                bookRepository.save(book);
            }
        }
    }

    private String normalizeLocale(String locale) {
        if (locale == null || locale.isEmpty()) {
            return DEFAULT_LOCALE;
        }
        String normalized = locale.split("[_-]")[0].toLowerCase();
        return normalized.isEmpty() ? DEFAULT_LOCALE : normalized;
    }

    private BookDTO applyTranslation(BookDTO dto, Book book, String locale) {
        if (DEFAULT_LOCALE.equals(locale)) {
            return dto;
        }

        Optional<BookTranslation> translation = bookTranslationRepository.findByBookIdAndLocale(book.getId(), locale);
        translation.ifPresent(t -> applyTranslationData(dto, t));
        return dto;
    }

    private void applyTranslationData(BookDTO dto, BookTranslation t) {
        if (t.getName() != null && !t.getName().isEmpty()) {
            dto.setName(t.getName());
        }
        if (t.getDescription() != null && !t.getDescription().isEmpty()) {
            dto.setDescription(t.getDescription());
        }
        if (t.getCharacteristics() != null && !t.getCharacteristics().isEmpty()) {
            dto.setCharacteristics(t.getCharacteristics());
        }
        if (t.getGenre() != null && !t.getGenre().isEmpty()) {
            dto.setGenre(t.getGenre());
        }
    }
}
