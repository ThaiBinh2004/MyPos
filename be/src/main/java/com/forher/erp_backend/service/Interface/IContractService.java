package com.forher.erp_backend.service.Interface;
import com.forher.erp_backend.entity.Contract;
import java.util.List;

public interface IContractService {
    List<Contract> getAllContracts();
    Contract getContractById(String id);
    List<Contract> getContractsByEmployee(String employeeId);
    Contract createContract(Contract contract);
    Contract updateContract(String id, Contract contractDetails);
    void terminateContract(String id);
    void deleteContract(String id);
    List<Contract> getExpiringContracts(int daysThreshold);
    Contract renewContract(String contractId, int monthsToAdd);
}
