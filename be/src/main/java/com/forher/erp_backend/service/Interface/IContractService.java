package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Contract;
import java.util.List;

public interface IContractService {
    List<Contract> getAllContracts(String branchId, String status);
    Contract getContractById(String id);
    List<Contract> getContractsByEmployee(String employeeId);
    Contract createContract(String employeeId, String contractType, String startDate, String endDate,
                            java.math.BigDecimal baseSalary, java.math.BigDecimal allowance,
                            String position, String workingHours, String leavePolicy, String otherTerms);
    Contract updateContract(String id, Contract details);
    Contract submitContract(String id);
    Contract approveContract(String id, String approvedById, String reviewerNote);
    Contract rejectContract(String id, String reviewerNote);
    void terminateContract(String id);
    Contract signContract(String id);
    List<Contract> getExpiringContracts(int daysThreshold, String branchId);
}
