package com.clareia.backend.security;

import com.clareia.backend.domain.entity.Dentist;
import com.clareia.backend.domain.enums.DentistRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

public record AuthenticatedDentist(
        String id,
        String clinicId,
        String email,
        DentistRole role
) {
    public static AuthenticatedDentist from(Dentist dentist) {
        return new AuthenticatedDentist(
                dentist.getId(),
                dentist.getClinicId(),
                dentist.getEmail(),
                dentist.getRole()
        );
    }

    public boolean isOwner() {
        return role == DentistRole.OWNER;
    }

    public Collection<? extends GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}
