package com.project.hospital.service;

import com.project.hospital.dto.AppointmentDTO;
import com.project.hospital.dto.CreateAppointmentDTO;
import com.project.hospital.dto.UpdateAppointmentDTO;
import com.project.hospital.entity.Appointment;
import com.project.hospital.entity.Doctor;
import com.project.hospital.entity.Patient;
import com.project.hospital.repository.AppointmentRepository;
import com.project.hospital.repository.DoctorRepository;
import com.project.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return convertToDTO(appointment);
    }

    public AppointmentDTO createAppointment(CreateAppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!"AVAILABLE".equals(doctor.getStatus())) {
            throw new RuntimeException("Doctor is not available");
        }

        Long conflictCount = appointmentRepository.countDoctorAppointmentsInTimeSlot(
                dto.getDoctorId(),
                dto.getAppointmentDateTime(),
                dto.getAppointmentDateTime().plusMinutes(30)
        );

        if (conflictCount > 0) {
            throw new RuntimeException("Time slot is already booked");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        appointment.setDurationInMinutes(dto.getDurationInMinutes() != null ? dto.getDurationInMinutes() : 30);
        appointment.setReason(dto.getReason());
        appointment.setNotes(dto.getNotes());
        appointment.setStatus("SCHEDULED");

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(savedAppointment);
    }

    @Transactional
    public AppointmentDTO updateAppointment(Long id, UpdateAppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (dto.getAppointmentDateTime() != null) appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        if (dto.getReason() != null) appointment.setReason(dto.getReason());
        if (dto.getNotes() != null) appointment.setNotes(dto.getNotes());
        if (dto.getStatus() != null) appointment.setStatus(dto.getStatus());
        if (dto.getDiagnosis() != null) appointment.setDiagnosis(dto.getDiagnosis());
        if (dto.getPrescription() != null) appointment.setPrescription(dto.getPrescription());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(updatedAppointment);
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }

    public List<AppointmentDTO> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientPatientId(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorDoctorId(doctorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AppointmentDTO convertToDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getAppointmentId(),
                appointment.getPatient().getPatientId(),
                appointment.getPatient().getName(),
                appointment.getDoctor().getDoctorId(),
                appointment.getDoctor().getName(),
                appointment.getAppointmentDateTime(),
                appointment.getDurationInMinutes(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getStatus(),
                appointment.getDiagnosis(),
                appointment.getPrescription(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }
}