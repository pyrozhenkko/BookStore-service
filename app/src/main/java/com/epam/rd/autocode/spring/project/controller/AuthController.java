package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import com.epam.rd.autocode.spring.project.dto.auth.AuthenticationRequest;
import com.epam.rd.autocode.spring.project.dto.auth.AuthenticationResponse;
import com.epam.rd.autocode.spring.project.dto.auth.CurrentUserResponse;
import com.epam.rd.autocode.spring.project.dto.auth.TokenRefreshRequest;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.Employee;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import com.epam.rd.autocode.spring.project.model.RefreshToken;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.LoginAttemptService;
import com.epam.rd.autocode.spring.project.service.ClientService;
import com.epam.rd.autocode.spring.project.service.EmployeeService;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final ClientService clientService;
    private final EmployeeService employeeService;
    private final RefreshTokenService refreshTokenService;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        if (loginAttemptService.isBlocked()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            loginAttemptService.loginSucceeded(request.getEmail());
        } catch (Exception e) {
            loginAttemptService.loginFailed(request.getEmail());
            throw e;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        String accessToken = jwtService.generateToken(userDetails);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());

        return ResponseEntity.ok(new AuthenticationResponse(accessToken, refreshToken.getToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return java.util.Optional.of(refreshTokenService.findByToken(requestRefreshToken))
                .map(refreshTokenService::verifyExpiration) // Перевірка терміну
                .map(RefreshToken::getUserEmail)
                .map(email -> {
                    refreshTokenService.deleteByToken(requestRefreshToken);

                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(email);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    String accessToken = jwtService.generateToken(userDetails);

                    return ResponseEntity.ok(new AuthenticationResponse(accessToken, newRefreshToken.getToken()));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        refreshTokenService.deleteByEmail(email);
        return ResponseEntity.ok("Log out successful");
    }

    @PostMapping("/register")
    public ResponseEntity<ClientDTO> register(@RequestBody ClientDTO clientDTO) {
        ClientDTO newClient = clientService.addClient(clientDTO);
        return new ResponseEntity<>(newClient, HttpStatus.CREATED);
    }

    @PostMapping("/register/employee")
    public ResponseEntity<EmployeeDTO> registerEmployee(@RequestBody EmployeeDTO employeeDTO) {
        EmployeeDTO newEmployee = employeeService.addEmployee(employeeDTO);
        return new ResponseEntity<>(newEmployee, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var employeeOpt = employeeRepository.findByEmail(email);
        if (employeeOpt.isPresent()) {
            Employee e = employeeOpt.get();
            return ResponseEntity.ok(new CurrentUserResponse(e.getEmail(), e.getName(),
                    e.isAdmin() ? "ADMIN" : "EMPLOYEE", null));
        }
        var clientOpt = clientRepository.findByEmail(email);
        if (clientOpt.isPresent()) {
            Client c = clientOpt.get();
            return ResponseEntity.ok(new CurrentUserResponse(c.getEmail(), c.getName(),
                    "CUSTOMER", c.getBalance()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}