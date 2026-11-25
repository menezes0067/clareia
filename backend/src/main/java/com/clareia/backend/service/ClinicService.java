package com.clareia.backend.service;

import com.clareia.backend.domain.entity.Clinic;
import com.clareia.backend.repository.ClinicRepository;
import com.clareia.backend.security.AuthenticatedDentist;
import com.clareia.backend.web.dto.ClinicResponse;
import com.clareia.backend.web.dto.CommandDtos.ClinicRequest;
import com.clareia.backend.web.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ClinicService {

    private final ClinicRepository clinicRepository;
    private final DomainValidationSupport validation;

    public ClinicService(ClinicRepository clinicRepository, DomainValidationSupport validation) {
        this.clinicRepository = clinicRepository;
        this.validation = validation;
    }

    @Transactional(readOnly = true)
    public ClinicResponse getClinic(AuthenticatedDentist principal) {
        Clinic clinic = clinicRepository.findById(principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Clínica não encontrada."));
        return ClinicResponse.from(clinic);
    }

    @Transactional
    public ClinicResponse updateClinic(AuthenticatedDentist principal, ClinicRequest request) {
        if (!principal.isOwner()) {
            throw ApiException.forbidden("Somente o dono da clínica pode alterar estes dados.");
        }

        Clinic clinic = clinicRepository.findById(principal.clinicId())
                .orElseThrow(() -> ApiException.notFound("Clínica não encontrada."));

        Map<String, String> errors = new LinkedHashMap<>();
        String name = validation.requireClinicName(request.name(), "name", errors);
        String address = validation.requireAddress(request.address(), "address", errors);
        String cnpj = validation.requireCnpj(request.cnpj(), "cnpj", errors);
        String phone = validation.requirePhone(request.phone(), "phone", errors);
        String email = validation.requireEmail(request.email(), "email", errors);
        validation.throwIfErrors(errors);

        if (clinicRepository.existsByCnpjAndIdNot(cnpj, clinic.getId())) {
            throw ApiException.conflict("cnpj", "Já existe outra clínica cadastrada com este CNPJ.");
        }

        clinic.setName(name);
        clinic.setAddress(address);
        clinic.setCnpj(cnpj);
        clinic.setPhone(phone);
        clinic.setEmail(email);

        return ClinicResponse.from(clinicRepository.save(clinic));
    }
}
