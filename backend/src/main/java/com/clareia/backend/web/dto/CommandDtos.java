package com.clareia.backend.web.dto;

import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.domain.enums.AppointmentType;
import com.clareia.backend.domain.enums.DentistStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class CommandDtos {

    private CommandDtos() {}

    public record ClinicRequest(
            @NotBlank(message = "Informe o nome da clínica.")
            String name,
            @NotBlank(message = "Informe o endereço.")
            String address,
            @NotBlank(message = "Informe um CNPJ válido.")
            String cnpj,
            @NotBlank(message = "Informe um telefone válido com DDD.")
            String phone,
            @NotBlank(message = "Informe um e-mail válido.")
            @Email(message = "Informe um e-mail válido.")
            String email
    ) {}

    public record DentistRequest(
            @NotBlank(message = "Informe o nome completo.")
            String name,
            @NotBlank(message = "Informe um e-mail válido.")
            @Email(message = "Informe um e-mail válido.")
            String email,
            @NotBlank(message = "Informe um telefone válido com DDD.")
            String phone,
            @NotBlank(message = "Informe o CRO.")
            String cro,
            @NotBlank(message = "Informe a especialidade.")
            String specialty,
            @Size(max = 400, message = "Use até 400 caracteres.")
            String bio,
            String password
    ) {}

    public record RegisterClinicRequest(
            @NotNull(message = "Informe os dados da dona da clínica.")
            @Valid
            DentistRequest owner,
            @NotNull(message = "Informe os dados da clínica.")
            @Valid
            ClinicRequest clinic
    ) {}

    public record DentistStatusRequest(
            @NotNull(message = "Informe o status.")
            DentistStatus status
    ) {}

    public record PatientRequest(
            @NotBlank(message = "Informe o nome completo.")
            String name,
            @NotBlank(message = "Informe um e-mail válido.")
            @Email(message = "Informe um e-mail válido.")
            String email,
            @NotBlank(message = "Informe um telefone válido com DDD.")
            String phone,
            @NotBlank(message = "Data inválida.")
            String birthDate,
            String dentistId,
            @Size(max = 1200, message = "Use até 1200 caracteres.")
            String notes
    ) {}

    public record AppointmentRequest(
            @NotBlank(message = "Escolha o paciente.")
            String patientId,
            String dentistId,
            @NotBlank(message = "Data inválida.")
            String date,
            @NotBlank(message = "Escolha um horário.")
            String startTime,
            @Min(value = 15, message = "Duração mínima de 15 min.")
            @Max(value = 240, message = "Duração máxima de 4 h.")
            Integer durationMinutes,
            @NotNull(message = "Escolha o procedimento.")
            AppointmentType type,
            @Size(max = 800, message = "Use até 800 caracteres.")
            String notes
    ) {}

    public record AppointmentStatusRequest(
            @NotNull(message = "Informe o status da consulta.")
            AppointmentStatus status
    ) {}
}
