package com.epam.rd.autocode.spring.project.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTest {

    @Test
    void newOrder_ShouldHavePendingStatus() {
        Order order = new Order();

        assertEquals("pending", order.getStatus(),
                "Newly created order should have status 'pending'");
    }

    @Test
    void orderStatus_ShouldBeInitializedByDefault() {
        Order order = new Order();

        assertNotNull(order.getStatus(),
                "Order status should not be null after creation");
        assertEquals("pending", order.getStatus(),
                "Default order status should be 'pending'");
    }
}
