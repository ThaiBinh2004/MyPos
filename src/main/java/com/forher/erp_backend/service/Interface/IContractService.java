package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Contract;
import java.util.List;

public interface IContractService {
    List<Contract> getAllContracts();
    Contract getContractById(String id);
    Contract createContract(Contract contract);
    Contract updateContract(String id, Contract contractDetails);
    void deleteContract(String id);

    // Nghiệp vụ: Lấy danh sách hợp đồng sắp hết hạn (ví dụ: trong 30 ngày tới)
    List<Contract> getExpiringContracts(int daysThreshold);
    // Nghiệp vụ: Gia hạn hợp đồng
    Contract renewContract(String contractId, int monthsToAdd);
}