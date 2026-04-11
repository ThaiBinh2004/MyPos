package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Customer;
import com.forher.erp_backend.repository.CustomerRepository;
import com.forher.erp_backend.service.Interface.ICustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService implements ICustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public List<Customer> getAllCustomers() { return customerRepository.findAll(); }

    @Override
    public Customer getCustomerById(String id) {
        return customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Khách hàng!"));
    }

    @Override
    @Transactional
    public Customer createCustomer(Customer customer) {
        customer.setLoyaltyPoints(0);
        customer.setCustomerRank("Thường");
        return customerRepository.save(customer);
    }

    @Override
    @Transactional
    public Customer updateCustomer(String id, Customer details) {
        Customer existing = getCustomerById(id);
        existing.setFullName(details.getFullName());
        existing.setEmail(details.getEmail());
        existing.setPhoneNumber(details.getPhoneNumber());
        return customerRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCustomer(String id) { customerRepository.deleteById(id); }

    // NGHIỆP VỤ: Tích điểm và tự động thăng hạng
    @Override
    @Transactional
    public void addLoyaltyPoints(String customerId, int points) {
        Customer customer = getCustomerById(customerId);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        updateCustomerRank(customerId); // Gọi hàm check thăng hạng
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void redeemPoints(String customerId, int pointsToUse) {
        Customer customer = getCustomerById(customerId);
        if (customer.getLoyaltyPoints() < pointsToUse) {
            throw new RuntimeException("Khách hàng không đủ điểm để tiêu!");
        }
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - pointsToUse);
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void updateCustomerRank(String customerId) {
        Customer customer = getCustomerById(customerId);
        int points = customer.getLoyaltyPoints();
        // Thuật toán thăng hạng giả định
        if (points >= 10000) customer.setCustomerRank("VIP");
        else if (points >= 5000) customer.setCustomerRank("Vàng");
        else if (points >= 2000) customer.setCustomerRank("Bạc");
        else customer.setCustomerRank("Thường");
        customerRepository.save(customer);
    }
}