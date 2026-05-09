package com.project.hospital.controller;

import com.project.hospital.dto.ApiResponse;
import com.project.hospital.dto.CreatePatientDTO;
import com.project.hospital.dto.PatientDTO;
import com.project.hospital.dto.UpdatePatientDTO;
import com.project.hospital.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class PatientController {
    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", patients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", patient));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(@RequestBody CreatePatientDTO dto) {
        PatientDTO patient = patientService.createPatient(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Patient created successfully", patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @PathVariable Long id,
            @RequestBody UpdatePatientDTO dto) {
        PatientDTO patient = patientService.updatePatient(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(200, "Patient updated successfully", patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Patient deleted successfully", null));
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<ApiResponse<List<PatientDTO>>> searchPatients(@PathVariable String name) {
        List<PatientDTO> patients = patientService.searchPatients(name);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", patients));
    }
}