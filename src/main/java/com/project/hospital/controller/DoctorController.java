package com.project.hospital.controller;

import com.project.hospital.dto.ApiResponse;
import com.project.hospital.dto.CreateDoctorDTO;
import com.project.hospital.dto.DoctorDTO;
import com.project.hospital.dto.UpdateDoctorDTO;
import com.project.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class DoctorController {
    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getAllDoctors() {
        List<DoctorDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorById(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", doctor));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDTO>> createDoctor(@RequestBody CreateDoctorDTO dto) {
        DoctorDTO doctor = doctorService.createDoctor(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Doctor created successfully", doctor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctor(
            @PathVariable Long id,
            @RequestBody UpdateDoctorDTO dto) {
        DoctorDTO doctor = doctorService.updateDoctor(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(200, "Doctor updated successfully", doctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Doctor deleted successfully", null));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsBySpecialization(
            @PathVariable String specialization) {
        List<DoctorDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", doctors));
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> searchDoctors(@PathVariable String name) {
        List<DoctorDTO> doctors = doctorService.searchDoctors(name);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", doctors));
    }

    @GetMapping("/available/all")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getAvailableDoctors() {
        List<DoctorDTO> doctors = doctorService.getAvailableDoctors();
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", doctors));
    }
}