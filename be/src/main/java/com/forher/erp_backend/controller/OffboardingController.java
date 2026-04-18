package com.forher.erp_backend.controller;

import com.forher.erp_backend.dto.OffboardingAssetReturnResponse;
import com.forher.erp_backend.dto.OffboardingResponse;
import com.forher.erp_backend.entity.Offboarding;
import com.forher.erp_backend.service.Interface.IOffboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr/offboarding")
@RequiredArgsConstructor
public class OffboardingController {

    private final IOffboardingService offboardingService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String branchId) {
        List<Offboarding> list = offboardingService.getAll(branchId);
        List<OffboardingResponse> result = list.stream().map(o ->
                OffboardingResponse.from(o,
                        offboardingService.getAssetReturns(o.getOffboardingId())
                                .stream().map(OffboardingAssetReturnResponse::from).toList())
        ).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            Offboarding o = offboardingService.getById(id);
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(id)
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.ok(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> initiate(@RequestBody Map<String, String> payload) {
        try {
            Offboarding o = offboardingService.initiate(
                    payload.get("employeeId"),
                    payload.get("initiatedByEmployeeId"),
                    payload.get("reason"),
                    LocalDate.parse(payload.get("lastWorkingDate"))
            );
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(o.getOffboardingId())
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.status(HttpStatus.CREATED).body(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/returns/{returnId}/confirm")
    public ResponseEntity<?> confirmAssetReturn(@PathVariable String returnId,
                                                @RequestBody Map<String, String> payload) {
        try {
            String returnStatus = payload.get("returnStatus");
            String notes = payload.get("notes");
            BigDecimal compensation = payload.get("compensationAmount") != null
                    ? new BigDecimal(payload.get("compensationAmount")) : BigDecimal.ZERO;
            return ResponseEntity.ok(
                    OffboardingAssetReturnResponse.from(
                            offboardingService.confirmAssetReturn(returnId, returnStatus, notes, compensation)
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit-approval")
    public ResponseEntity<?> submitApproval(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String otp = payload.get("otp");
            if (otp == null || !offboardingService.verifyOtp(id, "MANAGER", otp)) {
                return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn.");
            }
            Offboarding o = offboardingService.submitForApproval(id);
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(id)
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.ok(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            Offboarding o = offboardingService.approve(id,
                    payload.get("approvedByEmployeeId"),
                    payload.get("directorNote"));
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(id)
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.ok(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            Offboarding o = offboardingService.reject(id, payload.get("directorNote"));
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(id)
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.ok(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/otp/generate")
    public ResponseEntity<?> generateOtp(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String type = payload.getOrDefault("type", "EMPLOYEE");
        offboardingService.generateOtp(id, type);
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi tới email của bạn."));
    }

    @PostMapping("/{id}/employee-confirm")
    public ResponseEntity<?> employeeConfirm(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String otp = payload.get("otp");
            if (otp == null || !offboardingService.verifyOtp(id, "EMPLOYEE", otp)) {
                return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn.");
            }
            Offboarding o = offboardingService.employeeConfirm(id, payload.get("employeeId"));
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(id)
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.ok(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getByEmployee(@PathVariable String employeeId) {
        List<Offboarding> list = offboardingService.getByEmployee(employeeId);
        List<OffboardingResponse> result = list.stream().map(o ->
                OffboardingResponse.from(o,
                        offboardingService.getAssetReturns(o.getOffboardingId())
                                .stream().map(OffboardingAssetReturnResponse::from).toList())
        ).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pending-settlement")
    public ResponseEntity<?> getPendingSettlement() {
        return ResponseEntity.ok(
                offboardingService.getPendingSettlement().stream().map(o ->
                        OffboardingResponse.from(o,
                                offboardingService.getAssetReturns(o.getOffboardingId())
                                        .stream().map(OffboardingAssetReturnResponse::from).toList())
                ).toList()
        );
    }

    @PostMapping("/{id}/settle")
    public ResponseEntity<?> settle(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            Offboarding o = offboardingService.settle(id,
                    payload.get("settledByEmployeeId"),
                    payload.get("settlementMethod"),
                    payload.get("settlementNote"));
            List<OffboardingAssetReturnResponse> returns = offboardingService.getAssetReturns(id)
                    .stream().map(OffboardingAssetReturnResponse::from).toList();
            return ResponseEntity.ok(OffboardingResponse.from(o, returns));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
