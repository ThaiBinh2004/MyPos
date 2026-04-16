package com.forher.erp_backend.service.Interface;

import com.forher.erp_backend.entity.Supplier;

import java.util.List;

public interface ISupplierService {
    List<Supplier> getAllSuppliers();
    Supplier getSupplierById(String id);
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(String id, Supplier supplierDetails);
    void deleteSupplier(String id);}