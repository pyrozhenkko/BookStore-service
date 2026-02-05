package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.EmployeeDTO;
import com.epam.rd.autocode.spring.project.mapper.EmployeeMapper;
import com.epam.rd.autocode.spring.project.model.Employee;
import com.epam.rd.autocode.spring.project.repo.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private EmployeeMapper employeeMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private EmployeeDTO employeeDTO;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setEmail("emp@example.com");
        employee.setName("Employee One");

        employeeDTO = new EmployeeDTO();
        employeeDTO.setEmail("emp@example.com");
        employeeDTO.setName("Employee One");
        employeeDTO.setPassword("pass");
        employeeDTO.setActive(true);
    }

    @Test
    void getAllEmployees_ShouldReturnPage() {
        Pageable pageable = Pageable.unpaged();
        when(employeeRepository.findAll(pageable)).thenReturn(new PageImpl<>(Collections.singletonList(employee)));
        when(employeeMapper.toDto(employee)).thenReturn(employeeDTO);

        Page<EmployeeDTO> result = employeeService.getAllEmployees(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getEmployeeById_Found_ShouldReturnDto() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeMapper.toDto(employee)).thenReturn(employeeDTO);

        EmployeeDTO result = employeeService.getEmployeeById(1L);

        assertNotNull(result);
        assertEquals("emp@example.com", result.getEmail());
    }

    @Test
    void addEmployee_AdminPosition_ShouldSetAdminTrue() {
        employeeDTO.setPosition("Admin");
        when(employeeRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(employeeMapper.toEntity(employeeDTO)).thenReturn(employee);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(employeeRepository.save(any())).thenReturn(employee);
        when(employeeMapper.toDto(employee)).thenReturn(employeeDTO);

        employeeService.addEmployee(employeeDTO);

        assertTrue(employee.isAdmin());
        verify(employeeRepository).save(employee);
    }

    @Test
    void addEmployee_RegularPosition_ShouldSetAdminFalse() {
        employeeDTO.setPosition("Seller");
        when(employeeRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(employeeMapper.toEntity(employeeDTO)).thenReturn(employee);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(employeeRepository.save(any())).thenReturn(employee);
        when(employeeMapper.toDto(employee)).thenReturn(employeeDTO);

        employeeService.addEmployee(employeeDTO);

        assertFalse(employee.isAdmin());
    }

    @Test
    void deleteEmployeeById_NotExists_ShouldThrowException() {
        when(employeeRepository.existsById(1L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> employeeService.deleteEmployeeById(1L));
    }

    @Test
    void deleteEmployeeById_Exists_ShouldDelete() {
        when(employeeRepository.existsById(1L)).thenReturn(true);

        employeeService.deleteEmployeeById(1L);

        verify(employeeRepository).deleteById(1L);
    }
}
