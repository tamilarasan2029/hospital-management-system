package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentDTO {
    private LocalDateTime appointmentDateTime;
    private String reason;
    private String notes;
    private String status;
    private String diagnosis;
    private String prescription;
}