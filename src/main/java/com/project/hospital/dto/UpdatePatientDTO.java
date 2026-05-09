package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientDTO {
    private String name;
    private String email;
    private String phone;
    private String bloodType;
    private String medicalHistory;
}