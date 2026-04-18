package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Offboarding;
import com.forher.erp_backend.entity.OffboardingAssetReturn;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IOffboardingService {
    Offboarding initiate(String employeeId, String initiatedByEmployeeId, String reason, LocalDate lastWorkingDate);
    List<Offboarding> getAll(String branchId);
    Offboarding getById(String offboardingId);
    List<OffboardingAssetReturn> getAssetReturns(String offboardingId);
    OffboardingAssetReturn confirmAssetReturn(String returnId, String returnStatus, String notes, BigDecimal compensationAmount);
    Offboarding submitForApproval(String offboardingId);
    Offboarding approve(String offboardingId, String approvedByEmployeeId, String directorNote);
    Offboarding reject(String offboardingId, String directorNote);
    Offboarding employeeConfirm(String offboardingId, String employeeId);
    Offboarding settle(String offboardingId, String settledByEmployeeId, String settlementMethod, String settlementNote);
    List<Offboarding> getPendingSettlement();
    List<Offboarding> getByEmployee(String employeeId);
    String generateOtp(String offboardingId, String type);
    boolean verifyOtp(String offboardingId, String type, String code);
}
