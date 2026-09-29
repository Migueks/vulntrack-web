import { apiFileRequest, apiRequest } from "./apiClient";

// Recupera hallazgos con filtros, ordenación y paginación.
export const getFindings = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await apiRequest(`/findings${query ? `?${query}` : ""}`, {
    raw: true,
  });

  return {
    findings: response?.data ?? [],
    pagination: response?.pagination ?? null,
  };
};

// Recupera el detalle completo de un hallazgo.
export const getFindingById = async (id) => {
  return apiRequest(`/findings/${id}`);
};

// Asigna o desasigna un hallazgo.
export const assignFinding = async (id, assignedToId) => {
  return apiRequest(`/findings/${id}/assignment`, {
    method: "PATCH",
    body: {
      assignedToId,
    },
  });
};

// Cambia el estado respetando el workflow del backend.
export const updateFindingStatus = async (id, status, note = "") => {
  const body = {
    status,
  };

  if (note.trim()) {
    body.note = note.trim();
  }

  return apiRequest(`/findings/${id}/status`, {
    method: "PATCH",
    body,
  });
};

// Añade una nota al historial del hallazgo.
export const addFindingNote = async (id, note) => {
  return apiRequest(`/findings/${id}/notes`, {
    method: "POST",
    body: {
      note: note.trim(),
    },
  });
};

// Sube una evidencia mediante multipart/form-data.
export const uploadFindingEvidence = async (id, file) => {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest(`/findings/${id}/evidence`, {
    method: "POST",
    body: formData,
  });
};

// Elimina una evidencia del hallazgo.
export const deleteFindingEvidence = async (id, evidenceId) => {
  return apiRequest(`/findings/${id}/evidence/${evidenceId}`, {
    method: "DELETE",
  });
};

// Descarga una evidencia protegida utilizando el JWT.
export const downloadFindingEvidence = async (id, evidenceId, originalName) => {
  const blob = await apiFileRequest(
    `/findings/${id}/evidence/${evidenceId}/file`,
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = originalName;

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
