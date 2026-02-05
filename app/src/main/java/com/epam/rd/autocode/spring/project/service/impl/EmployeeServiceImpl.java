package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import com.epam.rd.autocode.spring.project.mapper.EmployeeMapper;
import com.epam.rd.autocode.spring.project.model.Employee;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import com.epam.rd.autocode.spring.project.repo.specification.EmployeeSpecification;
import com.epam.rd.autocode.spring.project.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<EmployeeDTO> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable)
                .map(employeeMapper::toDto);
    }

    @Override
    public Page<EmployeeDTO> searchEmployees(String keyword, Pageable pageable) {
        Specification<Employee> spec = EmployeeSpecification.hasKeyword(keyword);
        return employeeRepository.findAll(spec, pageable)
                .map(employeeMapper::toDto);
    }

    @Override
    public EmployeeDTO getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .map(employeeMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    @Override
    public EmployeeDTO getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .map(employeeMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
    }

    @Override
    @Transactional
    public EmployeeDTO updateEmployeeById(Long id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employee.setName(employeeDTO.getName());
        employee.setPhone(employeeDTO.getPhone());
        employee.setBirthDate(employeeDTO.getBirthDate());
        employee.setPosition(employeeDTO.getPosition());

        employee.setAdmin(checkPositionForAdmin(employeeDTO.getPosition()));

        if (!employeeDTO.isActive()) {
            String currentEmail = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            if (employee.getEmail().equals(currentEmail)) {
                throw new RuntimeException("You cannot block yourself");
            }
        }
        employee.setBlocked(!employeeDTO.isActive());

        if (employeeDTO.getPassword() != null && !employeeDTO.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(employeeDTO.getPassword()));
        }

        return employeeMapper.toDto(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void deleteEmployeeById(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public EmployeeDTO addEmployee(EmployeeDTO employeeDTO) {
        if (employeeRepository.findByEmail(employeeDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Employee with email " + employeeDTO.getEmail() + " already exists");
        }

        Employee employee = employeeMapper.toEntity(employeeDTO);
        employee.setPassword(passwordEncoder.encode(employeeDTO.getPassword()));

        // Автоматично визначаємо статус адміна на основі посади
        employee.setAdmin(checkPositionForAdmin(employeeDTO.getPosition()));

        return employeeMapper.toDto(employeeRepository.save(employee));
    }

    private boolean checkPositionForAdmin(String position) {
        if (position == null)
            return false;
        String pos = position.trim().toUpperCase();
        return pos.equals("ADMIN") ||
                pos.equals("ADMINISTRATOR") ||
                pos.equals("АДМІНІСТРАТОР") ||
                pos.equals("АДМІН");
    }
}
