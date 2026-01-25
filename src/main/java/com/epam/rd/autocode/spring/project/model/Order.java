package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ORDERS")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    private BigDecimal price;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<BookItem> bookItems = new ArrayList<>();


    // Назва міста (щоб зберегти історію, навіть якщо Ref зміниться)
    @Column(name = "delivery_city")
    private String deliveryCity;

    // Ref міста (для можливої інтеграції в майбутньому)
    @Column(name = "delivery_city_ref")
    private String deliveryCityRef;

    // Назва/Номер відділення
    @Column(name = "delivery_branch")
    private String deliveryBranch;

    // Ref відділення
    @Column(name = "delivery_branch_ref")
    private String deliveryBranchRef;
}