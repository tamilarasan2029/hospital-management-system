package com.project.hospital.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;  // ← ADD THIS
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    @JsonAlias("doctorId")// ← ADD THIS
    private Long doctorId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    @Column(nullable = false)
    private String qualifications;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 100)
    private String office;

    @Column(nullable = false)
    private Double consultationFee;

    @Column(nullable = false, columnDefinition = "varchar(20) default 'AVAILABLE'")
    private String status = "AVAILABLE";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}