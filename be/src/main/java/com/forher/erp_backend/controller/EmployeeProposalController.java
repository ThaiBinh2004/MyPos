package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Employee;
import com.forher.erp_backend.entity.EmployeeProposal;
import com.forher.erp_backend.repository.EmployeeProposalRepository;
import com.forher.erp_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/proposals")
@RequiredArgsConstructor
public class EmployeeProposalController {

    private final EmployeeProposalRepository proposalRepository;
    private final EmployeeRepository employeeRepository;

    // Lấy tất cả đề xuất (director) hoặc lọc theo status
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String status) {
        List<EmployeeProposal> list = status != null
                ? proposalRepository.findByStatusOrderByCreatedAtDesc(status)
                : proposalRepository.findAll();
        return ResponseEntity.ok(list.stream().map(this::toDto).toList());
    }

    // Đề xuất của 1 nhân viên cụ thể
    @GetMapping("/by-employee/{employeeId}")
    public ResponseEntity<?> getByEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(
                proposalRepository.findByEmployeeEmployeeIdOrderByCreatedAtDesc(employeeId)
                        .stream().map(this::toDto).toList()
        );
    }

    // Đề xuất của manager
    @GetMapping("/by-proposer/{proposedBy}")
    public ResponseEntity<?> getByProposer(@PathVariable String proposedBy) {
        return ResponseEntity.ok(
                proposalRepository.findByProposedByOrderByCreatedAtDesc(proposedBy)
                        .stream().map(this::toDto).toList()
        );
    }

    // Branch manager tạo đề xuất
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        try {
            Employee employee = employeeRepository.findById(body.get("employeeId"))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));

            EmployeeProposal proposal = EmployeeProposal.builder()
                    .proposalId("PROP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .employee(employee)
                    .proposedBy(body.get("proposedBy"))
                    .proposedByName(body.get("proposedByName"))
                    .proposedPosition(body.get("proposedPosition"))
                    .proposedDepartment(body.get("proposedDepartment"))
                    .reason(body.get("reason"))
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(proposalRepository.save(proposal)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Director duyệt
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        return processProposal(id, "approved", body);
    }

    // Director từ chối
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        return processProposal(id, "rejected", body);
    }

    private ResponseEntity<?> processProposal(String id, String newStatus, Map<String, String> body) {
        try {
            EmployeeProposal proposal = proposalRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đề xuất!"));
            proposal.setStatus(newStatus);
            if (body != null) proposal.setReviewerNote(body.get("reviewerNote"));

            // Nếu duyệt → cập nhật luôn thông tin nhân viên
            if ("approved".equals(newStatus)) {
                Employee emp = proposal.getEmployee();
                if (proposal.getProposedPosition() != null && !proposal.getProposedPosition().isBlank())
                    emp.setPosition(proposal.getProposedPosition());
                if (proposal.getProposedDepartment() != null && !proposal.getProposedDepartment().isBlank())
                    emp.setDepartment(proposal.getProposedDepartment());
                employeeRepository.save(emp);
            }

            return ResponseEntity.ok(toDto(proposalRepository.save(proposal)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    record ProposalDto(
            String proposalId, String employeeId, String employeeName,
            String proposedBy, String proposedByName,
            String proposedPosition, String proposedDepartment,
            String reason, String status, String reviewerNote, String createdAt
    ) {}

    private ProposalDto toDto(EmployeeProposal p) {
        return new ProposalDto(
                p.getProposalId(),
                p.getEmployee().getEmployeeId(),
                p.getEmployee().getFullName(),
                p.getProposedBy() != null ? p.getProposedBy() : "",
                p.getProposedByName() != null ? p.getProposedByName() : "",
                p.getProposedPosition() != null ? p.getProposedPosition() : "",
                p.getProposedDepartment() != null ? p.getProposedDepartment() : "",
                p.getReason() != null ? p.getReason() : "",
                p.getStatus(),
                p.getReviewerNote() != null ? p.getReviewerNote() : "",
                p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""
        );
    }
}
