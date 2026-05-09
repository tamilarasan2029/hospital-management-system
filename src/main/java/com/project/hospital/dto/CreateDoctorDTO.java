package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDoctorDTO {
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private Integer yearsOfExperience;
    private String qualifications;
    private String bio;
    private String office;
    private Double consultationFee;
}