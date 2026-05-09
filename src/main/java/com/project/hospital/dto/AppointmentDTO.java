package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime appointmentDateTime;
    private Integer durationInMinutes;
    private String reason;
    private String notes;
    private String status;
    private String diagnosis;
    private String prescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}