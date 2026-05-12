package com.project.hospital.repository;

import com.project.hospital.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByPhone(String phone);
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByNameContainingIgnoreCase(String name);
    List<Doctor> findByStatus(String status);

    @Query("SELECT d FROM Doctor d WHERE d.specialization = :specialization AND d.status = 'AVAILABLE'")
    List<Doctor> findAvailableDoctorsBySpecialization(@Param("specialization") String specialization);
}