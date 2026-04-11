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
        existing.setPhoneNumber(details.getPhoneNumber());
        existing.setBankAccount(details.getBankAccount());
        existing.setPosition(details.getPosition());
        return employeeRepository.save(existing);
    }

    // NGHIỆP VỤ: Đổi trạng thái thay vì xóa cứng
    @Override
    @Transactional
    public void resignEmployee(String id) {
        Employee existing = getEmployeeById(id);
        existing.setStatus("RESIGNED");
        employeeRepository.save(existing);
    }
}