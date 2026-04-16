package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Branch;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.BranchRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService implements IEmployeeService {

    private final EmployeeRepository employeeRepository;
    private final BranchRepository branchRepository;

    @Override
    public List<Employee> getAllEmployees() { return employeeRepository.findAll(); }

    @Override
    public List<Employee> getEmployeesByBranch(String branchId) {
        return employeeRepository.findByBranchBranchId(branchId);
    }

    @Override
    public Employee getEmployeeById(String id) {
        return employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên!"));
    }

    @Override
    @Transactional
    public Employee createEmployee(Employee employee) {
        if (employee.getBranch() != null) {
            Branch branch = branchRepository.findById(employee.getBranch().getBranchId())
                    .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));
            employee.setBranch(branch);
        }
        employee.setStatus("ACTIVE");
        return employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public Employee updateEmployee(String id, Employee details) {
        Employee existing = getEmployeeById(id);
        existing.setFullName(details.getFullName());
        existing.setDateOfBirth(details.getDateOfBirth());
        existing.setGender(details.getGender());
        existing.setIdCard(details.getIdCard());
        existing.setEmail(details.getEmail());
        existing.setPhoneNumber(details.getPhoneNumber());
        existing.setAddress(details.getAddress());
        existing.setBankAccount(details.getBankAccount());
        existing.setPosition(details.getPosition());
        existing.setDepartment(details.getDepartment());
        if (details.getBranch() != null && details.getBranch().getBranchId() != null) {
            Branch branch = branchRepository.findById(details.getBranch().getBranchId())
                    .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));
            existing.setBranch(branch);
        }
        return employeeRepository.save(existing);
    }

    // Nhân viên chỉ được cập nhật 3 trường này
    @Override
    @Transactional
    public Employee selfUpdate(String id, String phoneNumber, String address, String bankAccount) {
        Employee existing = getEmployeeById(id);
        if (phoneNumber != null) existing.setPhoneNumber(phoneNumber);
        if (address != null) existing.setAddress(address);
        if (bankAccount != null) existing.setBankAccount(bankAccount);
        return employeeRepository.save(existing);
    }

    @Override
    @Transactional
    public void resignEmployee(String id) {
        Employee existing = getEmployeeById(id);
        existing.setStatus("RESIGNED");
        employeeRepository.save(existing);
    }
}
