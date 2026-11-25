package com.clareia.backend.domain.util;

import java.util.UUID;

public final class IdGenerator {

    private IdGenerator() {}

    public static String newClinicId() {
        return "clinic-" + shortUuid();
    }

    public static String newOwnerDentistId() {
        return "dent-" + shortUuid();
    }

    public static String newDentistId() {
        return "dentist-" + shortUuid();
    }

    public static String newPatientId() {
        return "patient-" + shortUuid();
    }

    public static String newAppointmentId() {
        return "appointment-" + shortUuid();
    }

    private static String shortUuid() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
