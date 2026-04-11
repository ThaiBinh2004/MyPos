package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Contract;
import com.forher.erp_backend.repository.ContractRepository;
import com.forher.erp_backend.service.Interface.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final ContractRepository contractRepository;

    @Override
    public List<Contract> getAllContracts() { return contractRepository.findAll(); }

    @Override
    public Contract getContractById(String id) {
        return contractRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Hợp đồng!"));
    }

    @Override
    @Transactional
    public Contract createContract(Contract contract) {
        contract.setStatus("ACTIVE");
        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract updateContract(String id, Contract details) {
        Contract existing = getContractById(id);
        existing.setBaseSalary(details.getBaseSalary());
        existing.setAllowance(details.getAllowance());
        existing.setStatus(details.getStatus());
        return contractRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteContract(String id) { contractRepository.deleteById(id); }

    // NGHIỆP VỤ: Lọc hợp đồng sắp hết hạn (Ví dụ: còn dưới 30 ngày)
    @Override
    public List<Contract> getExpiringContracts(int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return contractRepository.findAll().stream()
                .filter(c -> c.getEndDate() != null
                        && "ACTIVE".equals(c.getStatus())
                        && !c.getEndDate().isAfter(thresholdDate))
                .collect(Collectors.toList());
    }

    // NGHIỆP VỤ: Gia hạn hợp đồng
    @Override
    @Transactional
    public Contract renewContract(String contractId, int monthsToAdd) {
        Contract contract = getContractById(contractId);
        if (contract.getEndDate() != null) {
            contract.setEndDate(contract.getEndDate().plusMonths(monthsToAdd));
        }
        return contractRepository.save(contract);
    }
}