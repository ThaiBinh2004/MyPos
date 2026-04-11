package com.forher.erp_backend.service;

import com.forher.erp_backend.entity.Asset;
import com.forher.erp_backend.entity.AssetHandover;
import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.repository.AssetHandoverRepository;
import com.forher.erp_backend.repository.AssetRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import com.forher.erp_backend.service.Interface.IAssetHandoverService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetHandoverService implements IAssetHandoverService {

    private final AssetHandoverRepository assetHandoverRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public void createRevokeHandover(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        // Lấy tất cả tài sản đang được nhân viên này giữ
        List<Asset> holdingAssets = assetRepository.findAll().stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getEmployeeId().equals(employeeId))
                .toList();

        if (holdingAssets.isEmpty()) {
            throw new RuntimeException("Nhân viên này không giữ tài sản nào của công ty!");
        }

        // Tạo một chuỗi JSON hoặc Text đơn giản liệt kê tài sản
        StringBuilder assetListJson = new StringBuilder("[");
        for (Asset a : holdingAssets) {
            assetListJson.append("{ \"id\": \"").append(a.getAssetId())
                    .append("\", \"name\": \"").append(a.getAssetName()).append("\" },");

            // Thu hồi: Xóa liên kết nhân viên khỏi tài sản
            a.setEmployee(null);
            a.setAssetCondition("ĐÃ THU HỒI");
            assetRepository.save(a);
        }
        assetListJson.append("]");

        AssetHandover handover = AssetHandover.builder()
                .handoverId("HO-" + System.currentTimeMillis())
                .employee(employee)
                .issueDate(LocalDate.now())
                .assetList(assetListJson.toString())
                .assetCondition("ĐẦY ĐỦ")
                .status("COMPLETED")
                .build();

        assetHandoverRepository.save(handover);
    }
}