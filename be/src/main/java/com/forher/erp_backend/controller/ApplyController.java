package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Candidate;
import com.forher.erp_backend.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/apply")
@RequiredArgsConstructor
public class ApplyController {

    private final CandidateRepository candidateRepository;

    @PostMapping
    public ResponseEntity<?> apply(@RequestBody Map<String, String> body) {
        try {
            String fullName = body.get("fullName");
            String email = body.get("email");
            if (fullName == null || fullName.isBlank() || email == null || email.isBlank())
                return ResponseEntity.badRequest().body("Họ tên và email không được để trống.");

            if (candidateRepository.findByEmail(email).isPresent())
                return ResponseEntity.badRequest().body("Email này đã được dùng để ứng tuyển trước đó.");

            long count = candidateRepository.count();
            String candidateId = String.format("CAN%03d", count + 1);

            Candidate candidate = Candidate.builder()
                    .candidateId(candidateId)
                    .fullName(fullName)
                    .email(email)
                    .phoneNumber(body.getOrDefault("phoneNumber", ""))
                    .appliedPosition(body.getOrDefault("appliedPosition", ""))
                    .source(body.getOrDefault("source", ""))
                    .status("NEW")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(candidateRepository.save(candidate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
