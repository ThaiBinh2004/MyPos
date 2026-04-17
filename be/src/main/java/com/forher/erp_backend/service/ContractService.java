package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.ContractRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final ContractRepository contractRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<Contract> getAllContracts(String branchId, String status) {
        if (branchId != null && status != null)
            return contractRepository.findByBranchAndStatusExcludingDirectors(branchId, status.toUpperCase());
        if (branchId != null)
            return contractRepository.findByBranchExcludingDirectors(branchId);
        if (status != null)
            return contractRepository.findByStatusOrderByStartDateDesc(status.toUpperCase());
        return contractRepository.findAll();
    }

    @Override
    public Contract getContractById(String id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng!"));
    }

    @Override
    public List<Contract> getContractsByEmployee(String employeeId) {
        return contractRepository.findByEmployeeEmployeeIdOrderByStartDateDesc(employeeId);
    }

    @Override
    @Transactional
    public Contract createContract(String employeeId, String contractType, String startDate, String endDate,
                                   BigDecimal baseSalary, BigDecimal allowance,
                                   String position, String workingHours, String leavePolicy, String otherTerms) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));

        String contractId = "CTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Contract contract = Contract.builder()
                .contractId(contractId)
                .employee(employee)
                .contractType(contractType)
                .startDate(LocalDate.parse(startDate))
                .endDate(endDate != null && !endDate.isBlank() ? LocalDate.parse(endDate) : null)
                .baseSalary(baseSalary)
                .allowance(allowance != null ? allowance : BigDecimal.ZERO)
                .position(position)
                .workingHours(workingHours)
                .leavePolicy(leavePolicy)
                .otherTerms(otherTerms)
                .status("DRAFT")
                .build();

        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract updateContract(String id, Contract details) {
        Contract existing = getContractById(id);
        String status = existing.getStatus();

        if ("TERMINATED".equals(status) || "PENDING".equals(status))
            throw new RuntimeException("Không thể chỉnh sửa hợp đồng ở trạng thái này!");

        // ACTIVE: cho sửa lương, phụ cấp, vị trí, gia hạn (ngày kết thúc)
        if ("ACTIVE".equals(status)) {
            if (details.getBaseSalary() != null) existing.setBaseSalary(details.getBaseSalary());
            if (details.getAllowance()  != null) existing.setAllowance(details.getAllowance());
            if (details.getPosition()  != null) existing.setPosition(details.getPosition());
            if (details.getEndDate()   != null) existing.setEndDate(details.getEndDate());
            return contractRepository.save(existing);
        }

        // DRAFT / REJECTED: sửa tất cả
        if (details.getContractType() != null) existing.setContractType(details.getContractType());
        if (details.getStartDate() != null) existing.setStartDate(details.getStartDate());
        existing.setEndDate(details.getEndDate());
        if (details.getBaseSalary() != null) existing.setBaseSalary(details.getBaseSalary());
        if (details.getAllowance() != null) existing.setAllowance(details.getAllowance());
        if (details.getPosition() != null) existing.setPosition(details.getPosition());
        if (details.getWorkingHours() != null) existing.setWorkingHours(details.getWorkingHours());
        if (details.getLeavePolicy() != null) existing.setLeavePolicy(details.getLeavePolicy());
        if (details.getOtherTerms() != null) existing.setOtherTerms(details.getOtherTerms());
        return contractRepository.save(existing);
    }

    @Override
    @Transactional
    public Contract submitContract(String id) {
        Contract contract = getContractById(id);
        String st = contract.getStatus();
        if (!"DRAFT".equals(st) && !"REJECTED".equals(st) && !"ACTIVE".equals(st))
            throw new RuntimeException("Chỉ có thể gửi duyệt hợp đồng ở trạng thái Nháp, Bị từ chối hoặc Đang hiệu lực!");
        contract.setStatus("PENDING");
        contract.setReviewerNote(null);
        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract approveContract(String id, String approvedById, String reviewerNote) {
        Contract contract = getContractById(id);
        if (!"PENDING".equals(contract.getStatus()))
            throw new RuntimeException("Hợp đồng không ở trạng thái chờ duyệt!");

        Employee approver = employeeRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người duyệt!"));

        contract.setStatus("ACTIVE");
        contract.setApprovedBy(approver);
        contract.setApprovedDate(LocalDateTime.now());
        contract.setReviewerNote(reviewerNote);
        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract rejectContract(String id, String reviewerNote) {
        Contract contract = getContractById(id);
        if (!"PENDING".equals(contract.getStatus()))
            throw new RuntimeException("Hợp đồng không ở trạng thái chờ duyệt!");
        contract.setStatus("REJECTED");
        contract.setReviewerNote(reviewerNote);
        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public void terminateContract(String id) {
        Contract contract = getContractById(id);
        contract.setStatus("TERMINATED");
        contract.setEndDate(LocalDate.now());
        contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract signContract(String id) {
        Contract contract = getContractById(id);
        if (!"ACTIVE".equals(contract.getStatus()))
            throw new RuntimeException("Chỉ có thể ký hợp đồng đang hiệu lực!");
        contract.setSignedByEmployee(true);
        contract.setSignedDate(LocalDateTime.now());
        return contractRepository.save(contract);
    }

    @Override
    public List<Contract> getExpiringContracts(int daysThreshold, String branchId) {
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        if (branchId != null)
            return contractRepository.findExpiringContractsByBranch(threshold, branchId);
        return contractRepository.findExpiringContracts(threshold);
    }
}
