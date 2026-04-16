package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Supplier;
import com.forher.erp_backend.repository.SupplierRepository;
import com.forher.erp_backend.service.Interface.ISupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService implements ISupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public Supplier getSupplierById(String id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp mã: " + id));
    }

    @Override
    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Override
    @Transactional
    public Supplier updateSupplier(String id, Supplier supplierDetails) {
        Supplier existing = getSupplierById(id);
        existing.setSupplierName(supplierDetails.getSupplierName());
        existing.setContact(supplierDetails.getContact());
        existing.setPhoneNumber(supplierDetails.getPhoneNumber());
        existing.setAddress(supplierDetails.getAddress());
        existing.setEmail(supplierDetails.getEmail());
        return supplierRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteSupplier(String id) {
        supplierRepository.deleteById(id);
    }
}