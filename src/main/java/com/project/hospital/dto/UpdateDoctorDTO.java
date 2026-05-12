package com.project.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDoctorDTO {
    private String name;
    private String phone;
    private String bio;
    private Double consultationFee;
    private String status;
}