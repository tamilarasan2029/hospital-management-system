package com.project.hospital.service;

import com.project.hospital.dto.CreatePatientDTO;
import com.project.hospital.dto.PatientDTO;
import com.project.hospital.dto.UpdatePatientDTO;
import com.project.hospital.entity.Patient;
import com.project.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return convertToDTO(patient);
    }

    public PatientDTO createPatient(CreatePatientDTO dto) {
        if (patientRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Patient with this email already exists");
        }

        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setEmail(dto.getEmail());
        patient.setPhone(dto.getPhone());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodType(dto.getBloodType());
        patient.setMedicalHistory(dto.getMedicalHistory());

        Patient savedPatient = patientRepository.save(patient);
        return convertToDTO(savedPatient);
    }

    @Transactional
    public PatientDTO updatePatient(Long id, UpdatePatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (dto.getName() != null) patient.setName(dto.getName());
        if (dto.getEmail() != null) patient.setEmail(dto.getEmail());
        if (dto.getPhone() != null) patient.setPhone(dto.getPhone());
        if (dto.getBloodType() != null) patient.setBloodType(dto.getBloodType());
        if (dto.getMedicalHistory() != null) patient.setMedicalHistory(dto.getMedicalHistory());

        Patient updatedPatient = patientRepository.save(patient);
        return convertToDTO(updatedPatient);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found");
        }
        patientRepository.deleteById(id);
    }

    public List<PatientDTO> searchPatients(String name) {
        return patientRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PatientDTO convertToDTO(Patient patient) {
        return new PatientDTO(
                patient.getPatientId(),
                patient.getName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getBloodType(),
                patient.getMedicalHistory(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }
}