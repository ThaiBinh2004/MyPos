package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.*;
import com.forher.erp_backend.repository.*;
import com.forher.erp_backend.service.Interface.IOffboardingService;
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
public class OffboardingService implements IOffboardingService {

    private final OffboardingRepository offboardingRepo;
    private final OffboardingAssetReturnRepository returnRepo;
    private final EmployeeRepository employeeRepo;
    private final AssetRepository assetRepo;
    private final ContractRepository contractRepo;
    private final OtpStore otpStore;
    private final EmailService emailService;

    @Override
    @Transactional
    public Offboarding initiate(String employeeId, String initiatedByEmployeeId, String reason, LocalDate lastWorkingDate) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + employeeId));
        Employee initiatedBy = employeeRepo.findById(initiatedByEmployeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người khởi tạo: " + initiatedByEmployeeId));

        String offboardingId = "OB" + String.format("%05d", offboardingRepo.count() + 1);

        List<Asset> assets = assetRepo.findByEmployeeEmployeeId(employeeId);

        String status = assets.isEmpty() ? "ASSETS_CONFIRMED" : "ASSETS_PENDING";

        Offboarding offboarding = Offboarding.builder()
                .offboardingId(offboardingId)
                .employee(employee)
                .initiatedBy(initiatedBy)
                .reason(reason)
                .lastWorkingDate(lastWorkingDate)
                .status(status)
                .build();
        offboarding = offboardingRepo.save(offboarding);

        for (Asset asset : assets) {
            String returnId = "RT" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            OffboardingAssetReturn ret = OffboardingAssetReturn.builder()
                    .returnId(returnId)
                    .offboarding(offboarding)
                    .asset(asset)
                    .returnStatus("PENDING")
                    .build();
            returnRepo.save(ret);
        }

        return offboarding;
    }

    @Override
    public List<Offboarding> getAll(String branchId) {
        if (branchId != null && !branchId.isBlank()) {
            return offboardingRepo.findByBranchOrderByCreatedAtDesc(branchId);
        }
        return offboardingRepo.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public Offboarding getById(String offboardingId) {
        return offboardingRepo.findById(offboardingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ nghỉ việc: " + offboardingId));
    }

    @Override
    public List<OffboardingAssetReturn> getAssetReturns(String offboardingId) {
        return returnRepo.findByOffboardingOffboardingId(offboardingId);
    }

    @Override
    @Transactional
    public OffboardingAssetReturn confirmAssetReturn(String returnId, String returnStatus,
                                                      String notes, BigDecimal compensationAmount) {
        OffboardingAssetReturn ret = returnRepo.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi trả tài sản: " + returnId));

        ret.setReturnStatus(returnStatus);
        ret.setReturnDate(LocalDate.now());
        ret.setNotes(notes);
        ret.setCompensationAmount(compensationAmount != null ? compensationAmount : BigDecimal.ZERO);
        returnRepo.save(ret);

        // Check if all assets are confirmed
        String offboardingId = ret.getOffboarding().getOffboardingId();
        List<OffboardingAssetReturn> all = returnRepo.findByOffboardingOffboardingId(offboardingId);
        boolean allConfirmed = all.stream().noneMatch(r -> "PENDING".equals(r.getReturnStatus()));

        if (allConfirmed) {
            Offboarding ob = ret.getOffboarding();
            ob.setStatus("ASSETS_CONFIRMED");
            offboardingRepo.save(ob);
        }

        return ret;
    }

    @Override
    @Transactional
    public Offboarding approve(String offboardingId, String approvedByEmployeeId, String directorNote) {
        Offboarding ob = getById(offboardingId);
        if (!"PENDING_APPROVAL".equals(ob.getStatus())) {
            throw new RuntimeException("Hồ sơ không ở trạng thái chờ duyệt.");
        }
        Employee approvedBy = employeeRepo.findById(approvedByEmployeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người duyệt."));

        ob.setStatus("COMPLETED");
        ob.setApprovedBy(approvedBy);
        ob.setApprovedDate(LocalDateTime.now());
        ob.setDirectorNote(directorNote);

        // Set employee status → INACTIVE
        Employee emp = ob.getEmployee();
        emp.setStatus("INACTIVE");
        employeeRepo.save(emp);

        // Terminate active contracts
        contractRepo.findByEmployeeEmployeeIdOrderByStartDateDesc(ob.getEmployee().getEmployeeId())
                .stream()
                .filter(c -> "ACTIVE".equals(c.getStatus()))
                .forEach(c -> {
                    c.setStatus("TERMINATED");
                    contractRepo.save(c);
                });

        return offboardingRepo.save(ob);
    }

    @Override
    @Transactional
    public Offboarding reject(String offboardingId, String directorNote) {
        Offboarding ob = getById(offboardingId);
        if (!"PENDING_APPROVAL".equals(ob.getStatus())) {
            throw new RuntimeException("Hồ sơ không ở trạng thái chờ duyệt.");
        }
        ob.setStatus("ASSETS_CONFIRMED");
        ob.setDirectorNote(directorNote);
        return offboardingRepo.save(ob);
    }

    @Override
    @Transactional
    public Offboarding employeeConfirm(String offboardingId, String employeeId) {
        Offboarding ob = getById(offboardingId);
        if (!ob.getEmployee().getEmployeeId().equals(employeeId)) {
            throw new RuntimeException("Không có quyền xác nhận hồ sơ này.");
        }
        if (!"ASSETS_CONFIRMED".equals(ob.getStatus())) {
            throw new RuntimeException("Tài sản chưa được xác nhận đầy đủ.");
        }
        ob.setEmployeeConfirmed(true);
        ob.setEmployeeConfirmedAt(LocalDateTime.now());
        return offboardingRepo.save(ob);
    }

    @Override
    @Transactional
    public Offboarding submitForApproval(String offboardingId) {
        Offboarding ob = getById(offboardingId);
        if (!"ASSETS_CONFIRMED".equals(ob.getStatus())) {
            throw new RuntimeException("Chỉ có thể gửi duyệt khi tất cả tài sản đã được xác nhận.");
        }
        if (!Boolean.TRUE.equals(ob.getEmployeeConfirmed())) {
            throw new RuntimeException("Nhân viên chưa xác nhận bàn giao tài sản.");
        }
        ob.setStatus("PENDING_APPROVAL");
        return offboardingRepo.save(ob);
    }

    @Override
    @Transactional
    public Offboarding settle(String offboardingId, String settledByEmployeeId, String settlementMethod, String settlementNote) {
        Offboarding ob = getById(offboardingId);
        if (!"COMPLETED".equals(ob.getStatus())) {
            throw new RuntimeException("Hồ sơ chưa được giám đốc phê duyệt.");
        }
        Employee settledBy = employeeRepo.findById(settledByEmployeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế toán."));
        ob.setStatus("SETTLED");
        ob.setSettledBy(settledBy);
        ob.setSettledAt(LocalDateTime.now());
        ob.setSettlementMethod(settlementMethod);
        ob.setSettlementNote(settlementNote);

        // Cập nhật hợp đồng → LIQUIDATED (Đã thanh lý)
        contractRepo.findByEmployeeEmployeeIdOrderByStartDateDesc(ob.getEmployee().getEmployeeId())
                .stream()
                .filter(c -> "TERMINATED".equals(c.getStatus()))
                .forEach(c -> { c.setStatus("LIQUIDATED"); contractRepo.save(c); });

        return offboardingRepo.save(ob);
    }

    @Override
    public List<Offboarding> getPendingSettlement() {
        return offboardingRepo.findByStatusOrderByCreatedAtDesc("COMPLETED");
    }

    @Override
    public List<Offboarding> getByEmployee(String employeeId) {
        return offboardingRepo.findByEmployeeEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    @Override
    public String generateOtp(String offboardingId, String type) {
        String otp = otpStore.generate(offboardingId + ":" + type);
        Offboarding ob = getById(offboardingId);
        Employee target = "EMPLOYEE".equals(type) ? ob.getEmployee() : ob.getInitiatedBy();
        if (target != null && target.getEmail() != null && !target.getEmail().isBlank()) {
            emailService.sendOtp(target.getEmail(), target.getFullName(), otp, offboardingId, type);
        }
        return otp;
    }

    @Override
    public boolean verifyOtp(String offboardingId, String type, String code) {
        return otpStore.verify(offboardingId + ":" + type, code);
    }
}
