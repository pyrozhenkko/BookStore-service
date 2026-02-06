package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import com.epam.rd.autocode.spring.project.dto.auth.AuthenticationRequest;
import com.epam.rd.autocode.spring.project.dto.auth.TokenRefreshRequest;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.Employee;
import com.epam.rd.autocode.spring.project.model.RefreshToken;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.LoginAttemptService;
import com.epam.rd.autocode.spring.project.service.ClientService;
import com.epam.rd.autocode.spring.project.service.EmployeeService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private LoginAttemptService loginAttemptService;

    @MockBean
    private ClientService clientService;

    @MockBean
    private EmployeeService employeeService;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private EmployeeRepository employeeRepository;

    @Test
    void login_Success_ShouldReturnTokens() throws Exception {
        AuthenticationRequest request = new AuthenticationRequest("user@test.com", "password");
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("user@test.com");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");

        when(loginAttemptService.isBlocked()).thenReturn(false);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    void login_TooManyRequests_ShouldReturn429() throws Exception {
        AuthenticationRequest request = new AuthenticationRequest("user@test.com", "password");
        when(loginAttemptService.isBlocked()).thenReturn(true);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void register_ShouldReturnCreatedClient() throws Exception {
        ClientDTO clientDTO = new ClientDTO();
        clientDTO.setEmail("new@test.com");
        when(clientService.addClient(any(ClientDTO.class))).thenReturn(clientDTO);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clientDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new@test.com"));
    }

    @Test
    void refreshToken_Success_ShouldReturnNewTokens() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("old-token");

        RefreshToken oldToken = new RefreshToken();
        oldToken.setUserEmail("user@test.com");

        RefreshToken newToken = new RefreshToken();
        newToken.setToken("new-refresh-token");

        UserDetails userDetails = mock(UserDetails.class);

        when(refreshTokenService.findByToken("old-token")).thenReturn(oldToken);
        when(refreshTokenService.verifyExpiration(any(RefreshToken.class))).thenReturn(oldToken);
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(newToken);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("new-access-token");

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"));
    }

    @Test
    void getCurrentUser_Employee_ShouldReturnResponse() throws Exception {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("emp@test.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Employee e = new Employee();
        e.setId(1L);
        e.setEmail("emp@test.com");
        e.setName("Emp Name");
        e.setAdmin(true);

        when(employeeRepository.findByEmail("emp@test.com")).thenReturn(Optional.of(e));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("emp@test.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void deactivateAccount_Client_ShouldSetBlocked() throws Exception {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("client@test.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Client c = new Client();
        c.setEmail("client@test.com");
        when(clientRepository.findByEmail("client@test.com")).thenReturn(Optional.of(c));

        mockMvc.perform(post("/api/auth/deactivate"))
                .andExpect(status().isOk());
    }
}
