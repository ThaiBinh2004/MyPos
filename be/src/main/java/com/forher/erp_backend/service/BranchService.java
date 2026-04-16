package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Branch;
import com.forher.erp_backend.repository.BranchRepository;
import com.forher.erp_backend.service.Interface.IBranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchService implements IBranchService {

    private final BranchRepository branchRepository;

    @Override
    public List<Branch> getAllBranches() { return branchRepository.findAll(); }

    @Override
    public Branch getBranchById(String id) {
        return branchRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Chi nhánh!"));
    }

    @Override
    @Transactional
    public Branch createBranch(Branch branch) {
        if (branch.getTotalEmployee() == null) branch.setTotalEmployee(0);
        return branchRepository.save(branch);
    }

    @Override
    @Transactional
    public Branch updateBranch(String id, Branch details) {
        Branch existing = getBranchById(id);
        existing.setBranchName(details.getBranchName());
        existing.setAddress(details.getAddress());
        return branchRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteBranch(String id) { branchRepository.deleteById(id); }

    @Override
    public int getTotalEmployeesByBranch(String branchId) {
        Branch branch = getBranchById(branchId);
        return branch.getTotalEmployee() != null ? branch.getTotalEmployee() : 0;
    }
}