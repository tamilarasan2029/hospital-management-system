package com.project.hospital.controller;

import com.project.hospital.dto.ApiResponse;
import com.project.hospital.dto.AppointmentDTO;
import com.project.hospital.dto.CreateAppointmentDTO;
import com.project.hospital.dto.UpdateAppointmentDTO;
import com.project.hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AppointmentController {
    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAllAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", appointments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", appointment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(
            @RequestBody CreateAppointmentDTO dto) {
        AppointmentDTO appointment = appointmentService.createAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Appointment booked successfully", appointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointment(
            @PathVariable Long id,
            @RequestBody UpdateAppointmentDTO dto) {
        AppointmentDTO appointment = appointmentService.updateAppointment(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(200, "Appointment updated successfully", appointment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Appointment cancelled successfully", null));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getPatientAppointments(
            @PathVariable Long patientId) {
        List<AppointmentDTO> appointments = appointmentService.getPatientAppointments(patientId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", appointments));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getDoctorAppointments(
            @PathVariable Long doctorId) {
        List<AppointmentDTO> appointments = appointmentService.getDoctorAppointments(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", appointments));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByStatus(
            @PathVariable String status) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", appointments));
    }
}