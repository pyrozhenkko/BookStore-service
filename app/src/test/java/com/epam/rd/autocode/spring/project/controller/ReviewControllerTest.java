package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.CommentRequest;
import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.CommentResponse;
import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.RatingRequest;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.epam.rd.autocode.spring.project.service.impl.ReviewServiceImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(ReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewServiceImpl reviewService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @Test
    void rateBook_ShouldReturnOk() throws Exception {
        RatingRequest request = new RatingRequest();
        request.setRating(5);
        doNothing().when(reviewService).setRating(anyLong(), anyInt());

        mockMvc.perform(post("/api/reviews/book/1/rate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void commentBook_ShouldReturnOk() throws Exception {
        CommentRequest request = new CommentRequest();
        request.setComment("Good book");
        request.setRating(5);
        doNothing().when(reviewService).addComment(anyLong(), anyString(), anyInt());

        mockMvc.perform(post("/api/reviews/book/1/comment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void getComments_ShouldReturnPagedComments() throws Exception {
        CommentResponse comment = new CommentResponse();
        comment.setComment("Great!");
        Page<CommentResponse> page = new PageImpl<>(List.of(comment), PageRequest.of(0, 10), 1);

        when(reviewService.getComments(anyLong(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/reviews/book/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].comment").value("Great!"));
    }
}
