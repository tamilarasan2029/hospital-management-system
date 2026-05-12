package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private Long doctorId;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private Integer yearsOfExperience;
    private String qualifications;
    private String bio;
    private String office;
    private Double consultationFee;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}