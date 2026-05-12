package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentDTO {
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentDateTime;
    private Integer durationInMinutes;
    private String reason;
    private String notes;
}