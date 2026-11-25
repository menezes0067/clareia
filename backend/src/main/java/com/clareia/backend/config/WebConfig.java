package com.clareia.backend.config;

import com.clareia.backend.domain.enums.AppointmentStatus;
import com.clareia.backend.domain.enums.AppointmentType;
import com.clareia.backend.domain.enums.DentistRole;
import com.clareia.backend.domain.enums.DentistStatus;
import com.clareia.backend.domain.enums.DentistTone;
import com.clareia.backend.domain.enums.PatientStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Clock;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public Clock systemClock() {
        return Clock.systemUTC();
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, DentistRole.class, DentistRole::fromValue);
        registry.addConverter(String.class, DentistStatus.class, DentistStatus::fromValue);
        registry.addConverter(String.class, DentistTone.class, DentistTone::fromValue);
        registry.addConverter(String.class, PatientStatus.class, PatientStatus::fromValue);
        registry.addConverter(String.class, AppointmentType.class, AppointmentType::fromValue);
        registry.addConverter(String.class, AppointmentStatus.class, AppointmentStatus::fromValue);
    }
}
