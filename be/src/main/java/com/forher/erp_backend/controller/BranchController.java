package com.forher.erp_backend.controller;

import com.forher.erp_backend.entity.Branch;
import com.forher.erp_backend.service.Interface.IBranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hr/branches")
@RequiredArgsConstructor
public class BranchController {

    private final IBranchService branchService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(branchService.getAllBranches()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try { return ResponseEntity.ok(branchService.getBranchById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Branch branch) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.createBranch(branch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Branch details) {
        return ResponseEntity.ok(branchService.updateBranch(id, details));
    }
}
