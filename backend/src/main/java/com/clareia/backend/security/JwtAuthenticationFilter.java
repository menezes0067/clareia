package com.clareia.backend.security;

import com.clareia.backend.repository.DentistRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final DentistRepository dentistRepository;

    public JwtAuthenticationFilter(JwtService jwtService, DentistRepository dentistRepository) {
        this.jwtService = jwtService;
        this.dentistRepository = dentistRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(BEARER_PREFIX.length()).trim();
            jwtService.parseToken(token).ifPresent(claims ->
                    dentistRepository.findByIdAndClinicId(claims.dentistId(), claims.clinicId())
                            .filter(dentist -> dentist.isActive())
                            .ifPresent(dentist -> {
                                AuthenticatedDentist principal = AuthenticatedDentist.from(dentist);
                                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.authorities()
                                );
                                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                SecurityContextHolder.getContext().setAuthentication(auth);
                            })
            );
        }
        filterChain.doFilter(request, response);
    }
}
