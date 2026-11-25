package com.clareia.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClareiaApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("accessToken").asText();
    }

    @Test
    void loginBlocksInactiveDentistAndWrongPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "bruno@clareia.app", "password", "demo123"))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "marina@clareia.app", "password", "errada"))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/demo/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].email").value("marina@clareia.app"));
    }

    @Test
    void dentistCannotAccessOtherDentistDataOrClinicSettings() throws Exception {
        String rafaelToken = loginAndGetToken("rafael@clareia.app", "demo123");

        // Workspace só retorna pacientes e consultas do próprio Rafael
        MvcResult wsResult = mockMvc.perform(get("/api/v1/workspace")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + rafaelToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dentists", hasSize(1)))
                .andExpect(jsonPath("$.dentists[0].id").value("dent-rafael"))
                .andReturn();

        JsonNode ws = objectMapper.readTree(wsResult.getResponse().getContentAsString());
        for (JsonNode patient : ws.get("patients")) {
            assertThat(patient.get("dentistId").asText()).isEqualTo("dent-rafael");
        }
        for (JsonNode appointment : ws.get("appointments")) {
            assertThat(appointment.get("dentistId").asText()).isEqualTo("dent-rafael");
        }

        // Não pode abrir paciente da Marina (patient-01)
        mockMvc.perform(get("/api/v1/patients/patient-01")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + rafaelToken))
                .andExpect(status().isForbidden());

        // Não pode editar configurações da clínica
        mockMvc.perform(put("/api/v1/clinic")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + rafaelToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Outro Nome",
                                "address", "Rua Teste, 100",
                                "cnpj", "12.345.678/0001-95",
                                "phone", "(11) 3082-4410",
                                "email", "ola@clareia.app"
                        ))))
                .andExpect(status().isForbidden());

        // Não pode criar dentista
        mockMvc.perform(post("/api/v1/dentists")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + rafaelToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Dr. Novo Teste",
                                "email", "novo@clareia.app",
                                "phone", "(11) 99999-8888",
                                "cro", "CRO-SP 99.111",
                                "specialty", "Clínica geral"
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void onboardingCreatesIsolatedClinicAndOwnerCannotBeDeactivated() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register-clinic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "owner", Map.of(
                                        "name", "Dra. Helena Barros",
                                        "email", "HELENA@NOVACLINICA.APP",
                                        "phone", "11999991234",
                                        "cro", "cro-sp 12.345",
                                        "specialty", "Endodontia"
                                ),
                                "clinic", Map.of(
                                        "name", "Clínica Helena",
                                        "address", "Rua Nova, 42 — São Paulo",
                                        "cnpj", "11222333000181",
                                        "phone", "1133334444",
                                        "email", "CONTATO@CLINICAHELENA.COM"
                                )
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clinic.id", startsWith("clinic-")))
                .andExpect(jsonPath("$.clinic.cnpj").value("11.222.333/0001-81"))
                .andExpect(jsonPath("$.clinic.phone").value("(11) 3333-4444"))
                .andExpect(jsonPath("$.clinic.email").value("contato@clinicahelena.com"))
                .andExpect(jsonPath("$.dentist.id", startsWith("dent-")))
                .andExpect(jsonPath("$.dentist.email").value("helena@novaclinica.app"))
                .andExpect(jsonPath("$.dentist.cro").value("CRO-SP 12.345"))
                .andExpect(jsonPath("$.dentist.role").value("owner"))
                .andExpect(jsonPath("$.dentist.tone").value("teal"))
                .andReturn();

        JsonNode created = objectMapper.readTree(result.getResponse().getContentAsString());
        String ownerToken = created.get("accessToken").asText();
        String ownerId = created.get("dentist").get("id").asText();

        // Workspace começa vazio e isolado da clínica demo
        mockMvc.perform(get("/api/v1/workspace")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dentists", hasSize(1)))
                .andExpect(jsonPath("$.patients", hasSize(0)))
                .andExpect(jsonPath("$.appointments", hasSize(0)));

        // Dono não pode ser desativado
        mockMvc.perform(patch("/api/v1/dentists/" + ownerId + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "inactive"))))
                .andExpect(status().isBadRequest());

        // Não enxerga paciente da clínica demo (404 por isolamento multi-tenant)
        mockMvc.perform(get("/api/v1/patients/patient-01")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void enforcesAppointmentConflictsPastDatesAndSoftDeletePatients() throws Exception {
        String marinaToken = loginAndGetToken("marina@clareia.app", "demo123");

        // Criar paciente com data futura falha
        mockMvc.perform(post("/api/v1/patients")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Paciente Futuro",
                                "email", "futuro@email.com",
                                "phone", "(11) 98888-7777",
                                "birthDate", LocalDate.now().plusDays(10).toString(),
                                "dentistId", "dent-marina",
                                "notes", ""
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.birthDate").isNotEmpty());

        // Criar paciente válido, arquivar e reativar
        MvcResult patResult = mockMvc.perform(post("/api/v1/patients")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Paciente Teste API",
                                "email", "PACIENTE.API@EMAIL.COM",
                                "phone", "11988887766",
                                "birthDate", "1995-04-20",
                                "dentistId", "dent-marina",
                                "notes", "Observação clínica"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", startsWith("patient-")))
                .andExpect(jsonPath("$.email").value("paciente.api@email.com"))
                .andExpect(jsonPath("$.phone").value("(11) 98888-7766"))
                .andExpect(jsonPath("$.status").value("active"))
                .andReturn();

        String patientId = objectMapper.readTree(patResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(patch("/api/v1/patients/" + patientId + "/archive")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("archived"));

        mockMvc.perform(patch("/api/v1/patients/" + patientId + "/restore")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"));

        // Agendar no passado falha
        mockMvc.perform(post("/api/v1/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientId", patientId,
                                "dentistId", "dent-marina",
                                "date", LocalDate.now().minusDays(2).toString(),
                                "startTime", "09:00",
                                "durationMinutes", 30,
                                "type", "evaluation"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.date").isNotEmpty());

        String futureDate = LocalDate.now().plusDays(40).toString();

        // Agendar consulta futura válida
        MvcResult apptResult = mockMvc.perform(post("/api/v1/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientId", patientId,
                                "dentistId", "dent-marina",
                                "date", futureDate,
                                "startTime", "10:00",
                                "durationMinutes", 60,
                                "type", "whitening",
                                "notes", "Primeira sessão"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", startsWith("appointment-")))
                .andExpect(jsonPath("$.status").value("scheduled"))
                .andReturn();

        String apptId = objectMapper.readTree(apptResult.getResponse().getContentAsString()).get("id").asText();

        // Conflito de dentista no mesmo horário
        mockMvc.perform(post("/api/v1/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientId", "patient-01",
                                "dentistId", "dent-marina",
                                "date", futureDate,
                                "startTime", "10:30",
                                "durationMinutes", 30,
                                "type", "evaluation"
                        ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fieldErrors.startTime").isNotEmpty());

        // Conflito de paciente no mesmo horário (mesmo com outro dentista)
        mockMvc.perform(post("/api/v1/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientId", patientId,
                                "dentistId", "dent-rafael",
                                "date", futureDate,
                                "startTime", "10:30",
                                "durationMinutes", 30,
                                "type", "evaluation"
                        ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fieldErrors.patientId").isNotEmpty());

        // Cancelar consulta libera o horário
        mockMvc.perform(patch("/api/v1/appointments/" + apptId + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "cancelled"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("cancelled"));

        // Agora outro agendamento no mesmo horário é aceito
        mockMvc.perform(post("/api/v1/appointments")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientId", "patient-01",
                                "dentistId", "dent-marina",
                                "date", futureDate,
                                "startTime", "10:00",
                                "durationMinutes", 60,
                                "type", "cleaning"
                        ))))
                .andExpect(status().isCreated());

        // Tentar reativar a cancelada agora acusa conflito
        mockMvc.perform(patch("/api/v1/appointments/" + apptId + "/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "scheduled"))))
                .andExpect(status().isConflict());
    }

    @Test
    void deactivatingDentistRevokesTokenAndResetDemoRestoresState() throws Exception {
        String marinaToken = loginAndGetToken("marina@clareia.app", "demo123");
        String camilaToken = loginAndGetToken("camila@clareia.app", "demo123");

        // Camila consegue consultar /auth/me enquanto ativa
        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + camilaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dentist.id").value("dent-camila"));

        // Marina desativa Camila
        mockMvc.perform(patch("/api/v1/dentists/dent-camila/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "inactive"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("inactive"));

        // Token existente da Camila deixa de funcionar imediatamente
        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + camilaToken))
                .andExpect(status().isUnauthorized());

        // Reset demo restaura Camila para active e devolve token válido da Marina
        mockMvc.perform(post("/api/v1/demo/reset")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + marinaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dentist.id").value("dent-marina"));

        // Camila volta a conseguir logar
        loginAndGetToken("camila@clareia.app", "demo123");
    }
}
