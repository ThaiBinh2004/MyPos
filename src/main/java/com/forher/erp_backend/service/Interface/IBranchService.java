package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Branch;
import java.util.List;

public interface IBranchService {
    List<Branch> getAllBranches();
    Branch getBranchById(String id);
    Branch createBranch(Branch branch);
    Branch updateBranch(String id, Branch branchDetails);
    void deleteBranch(String id);

    // Nghiệp vụ: Lấy tổng số nhân viên của một chi nhánh
    int getTotalEmployeesByBranch(String branchId);
}