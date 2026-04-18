package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.OrderResponse;
import com.forher.erp_backend.entity.Customer;
import com.forher.erp_backend.repository.CustomerRepository;
import com.forher.erp_backend.repository.OrderDetailRepository;
import com.forher.erp_backend.repository.OrdersRepository;
import com.forher.erp_backend.service.Interface.ICustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final ICustomerService customerService;
    private final CustomerRepository customerRepo;
    private final OrdersRepository ordersRepo;
    private final OrderDetailRepository detailRepo;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String phone) {
        if (phone != null && !phone.isBlank()) {
            return customerRepo.findByPhoneNumber(phone)
                    .map(c -> ResponseEntity.ok(java.util.List.of(c)))
                    .orElse(ResponseEntity.ok(java.util.List.of()));
        }
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(customerService.getCustomerById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customer));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getOrders(@PathVariable String id) {
        var orders = ordersRepo.findByCustomerCustomerIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(orders.stream()
                .map(o -> OrderResponse.from(o, detailRepo.findByOrderOrderId(o.getOrderId())))
                .toList());
    }
}
