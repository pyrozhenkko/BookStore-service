package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.review.ReviewDTOs.*;
import com.epam.rd.autocode.spring.project.service.impl.ReviewServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewServiceImpl reviewService;

    @PostMapping("/book/{bookId}/rate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> rateBook(@PathVariable Long bookId, @RequestBody RatingRequest request) {
        reviewService.setRating(bookId, request.getRating());
        return ResponseEntity.ok("Rating saved");
    }

    @PostMapping("/book/{bookId}/comment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> commentBook(@PathVariable Long bookId, @RequestBody CommentRequest request) {
        reviewService.addComment(bookId, request.getComment(), request.getRating());
        return ResponseEntity.ok("Comment added");
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable Long bookId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getComments(bookId, pageable));
    }
}