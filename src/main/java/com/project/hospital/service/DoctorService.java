package com.project.hospital.service;

import com.project.hospital.dto.CreateDoctorDTO;
import com.project.hospital.dto.DoctorDTO;
import com.project.hospital.dto.UpdateDoctorDTO;
import com.project.hospital.entity.Doctor;
import com.project.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return convertToDTO(doctor);
    }

    public DoctorDTO createDoctor(CreateDoctorDTO dto) {
        if (doctorRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor with this email already exists");
        }

        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());
        doctor.setQualifications(dto.getQualifications());
        doctor.setBio(dto.getBio());
        doctor.setOffice(dto.getOffice());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setStatus("AVAILABLE");

        Doctor savedDoctor = doctorRepository.save(doctor);
        return convertToDTO(savedDoctor);
    }

    @Transactional
    public DoctorDTO updateDoctor(Long id, UpdateDoctorDTO dto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (dto.getName() != null) doctor.setName(dto.getName());
        if (dto.getPhone() != null) doctor.setPhone(dto.getPhone());
        if (dto.getBio() != null) doctor.setBio(dto.getBio());
        if (dto.getConsultationFee() != null) doctor.setConsultationFee(dto.getConsultationFee());
        if (dto.getStatus() != null) doctor.setStatus(dto.getStatus());

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return convertToDTO(updatedDoctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found");
        }
        doctorRepository.deleteById(id);
    }

    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> searchDoctors(String name) {
        return doctorRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> getAvailableDoctors() {
        return doctorRepository.findByStatus("AVAILABLE")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        return new DoctorDTO(
                doctor.getDoctorId(),
                doctor.getName(),
                doctor.getEmail(),
                doctor.getPhone(),
                doctor.getSpecialization(),
                doctor.getYearsOfExperience(),
                doctor.getQualifications(),
                doctor.getBio(),
                doctor.getOffice(),
                doctor.getConsultationFee(),
                doctor.getStatus(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }
}