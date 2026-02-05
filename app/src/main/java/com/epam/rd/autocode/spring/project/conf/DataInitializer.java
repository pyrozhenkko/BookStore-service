package com.epam.rd.autocode.spring.project.conf;

import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.Employee;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        hashClientPasswords();
        hashEmployeePasswords();
    }

    private void hashClientPasswords() {
        List<Client> clients = clientRepository.findAll();
        for (Client client : clients) {
            if (client.getPassword() != null && !client.getPassword().startsWith("$2")) {
                String rawPassword = client.getPassword();
                client.setPassword(passwordEncoder.encode(rawPassword));
                clientRepository.save(client);
                log.info("Encoded password for client: {}", client.getEmail());
            }
        }
    }

    private void hashEmployeePasswords() {
        List<Employee> employees = employeeRepository.findAll();
        for (Employee employee : employees) {
            if (employee.getPassword() != null && !employee.getPassword().startsWith("$2")) {
                String rawPassword = employee.getPassword();
                employee.setPassword(passwordEncoder.encode(rawPassword));
                employeeRepository.save(employee);
                log.info("Encoded password for employee: {}", employee.getEmail());
            }
        }
    }
}