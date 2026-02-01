package com.epam.rd.autocode.spring.project.dto.auth;

import lombok.Data;

public class PasswordResetDTOs {

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }
}