package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.model.enums.AgeGroup;
import com.epam.rd.autocode.spring.project.model.enums.Language;
import com.epam.rd.autocode.spring.project.service.impl.BookServiceImpl;
import com.epam.rd.autocode.spring.project.service.impl.FileStorageService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(BookController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookServiceImpl bookService;

    @MockBean
    private FileStorageService fileStorageService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @Test
    void searchBooks_ShouldReturnPagedBooks() throws Exception {
        BookDTO book = new BookDTO();
        book.setName("Test Book");
        Page<BookDTO> page = new PageImpl<>(List.of(book), PageRequest.of(0, 10), 1);

        when(bookService.searchBooks(anyString(), nullable(String.class), nullable(String.class),
                nullable(BigDecimal.class), nullable(BigDecimal.class),
                nullable(Language.class), nullable(AgeGroup.class),
                any(Pageable.class), nullable(String.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/books/search")
                .param("keyword", "Test"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Book"));
    }

    @Test
    void getBookByName_ShouldReturnBook() throws Exception {
        BookDTO book = new BookDTO();
        book.setName("TestBook");
        when(bookService.getBookByName(eq("TestBook"), anyString())).thenReturn(book);

        mockMvc.perform(get("/api/books/TestBook"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("TestBook"));
    }

    @Test
    void addBook_ShouldReturnCreated() throws Exception {
        BookDTO book = new BookDTO();
        book.setName("New Book");
        when(bookService.addBook(any(BookDTO.class))).thenReturn(book);

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(book)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Book"));
    }

    @Test
    void updateBook_ShouldReturnUpdated() throws Exception {
        BookDTO book = new BookDTO();
        book.setName("Updated Book");
        when(bookService.updateBookByName(anyString(), any(BookDTO.class), anyString())).thenReturn(book);

        mockMvc.perform(put("/api/books/OldName")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(book)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Book"));
    }

    @Test
    void deleteBook_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/books/TestBook"))
                .andExpect(status().isNoContent());
    }

    @Test
    void uploadBookImage_ShouldReturnUpdatedBook() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "content".getBytes());
        BookDTO book = new BookDTO();
        book.setImageUrls(List.of("http://image.url"));

        when(fileStorageService.storeFile(any())).thenReturn("http://image.url");
        when(bookService.addImageToBook(anyString(), anyString())).thenReturn(book);

        mockMvc.perform(multipart("/api/books/TestBook/images")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrls[0]").value("http://image.url"));
    }
}
