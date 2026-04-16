package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Employee;
import java.util.List;

public interface IEmployeeService {
    List<Employee> getAllEmployees();
    Employee getEmployeeById(String id);
    Employee createEmployee(Employee employee);
    Employee updateEmployee(String id, Employee employeeDetails);

    // Nghiệp vụ: Đổi trạng thái nhân viên thành "Nghỉ việc" thay vì xóa hẳn
    void resignEmployee(String id);
    Employee selfUpdate(String id, String phoneNumber, String address, String bankAccount);
    List<Employee> getEmployeesByBranch(String branchId);
}