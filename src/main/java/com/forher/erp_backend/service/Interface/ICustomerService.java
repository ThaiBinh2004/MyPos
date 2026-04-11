package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Customer;

import java.util.List;

public interface ICustomerService {

    List<Customer> getAllCustomers();
    Customer getCustomerById(String id);
    Customer createCustomer(Customer customer);
    Customer updateCustomer(String id, Customer customerDetails);
    void deleteCustomer(String id);
    // Nghiệp vụ Khách hàng thân thiết
    void addLoyaltyPoints(String customerId, int points);
    void redeemPoints(String customerId, int pointsToUse);
    void updateCustomerRank(String customerId); // Tự động lên hạng Vàng, Bạc...
}