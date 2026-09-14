import api from '../core/api.service';
import { PacienteCreateDto, PacienteReadDto } from '../models/paciente.model';
import axios from 'axios';

function parseApiError(err: any): string {
  if (!err) return 'Erro desconhecido';
  // Axios error with response
  const resp = err.response?.data;
  if (!resp) return err.message ?? 'Erro desconhecido';
  // resp pode ser string, { message }, { errors }, array, etc.
  if (typeof resp === 'string') return resp;
  if (resp.message) return resp.message;
  // ASP.NET style: { errors: { Field: ["msg1","msg2"] } }
  if (resp.errors && typeof resp.errors === 'object') {
    const parts: string[] = [];
    for (const k of Object.keys(resp.errors)) {
      const v = resp.errors[k];
      if (Array.isArray(v)) parts.push(...v);
      else parts.push(String(v));
    }
    return parts.join(' • ');
  }
  // array of strings
  if (Array.isArray(resp)) return resp.join(' • ');
  try {
    return JSON.stringify(resp);
  } catch {
    return 'Erro desconhecido';
  }
}

class PacienteService {
  async list(): Promise<PacienteReadDto[]> {
    try {
      const r = await api.get<PacienteReadDto[]>('/api/Pacientes');
      return r.data;
    } catch (err: any) {
      throw new Error(parseApiError(err));
    }
  }

  async getById(id: string): Promise<PacienteReadDto> {
    try {
      const r = await api.get<PacienteReadDto>(`/api/Pacientes/${id}`);
      return r.data;
    } catch (err: any) {
      throw new Error(parseApiError(err));
    }
  }

  async create(dto: PacienteCreateDto): Promise<PacienteReadDto> {
    try {
      const r = await api.post<PacienteReadDto>('/api/Pacientes', dto);
      return r.data;
    } catch (err: any) {
      throw new Error(parseApiError(err));
    }
  }

  async update(id: string, dto: PacienteCreateDto): Promise<PacienteReadDto> {
    try {
      const r = await api.put<PacienteReadDto>(`/api/Pacientes/${id}`, dto);
      return r.data;
    } catch (err: any) {
      throw new Error(parseApiError(err));
    }
  }

  // Delete físico da API é usado para inativação (conforme backend)
  async delete(id: string): Promise<any> {
    try {
      const r = await api.delete(`/api/Pacientes/${id}`);
      return r.data;
    } catch (err: any) {
      throw new Error(parseApiError(err));
    }
  }
}

export const pacienteService = new PacienteService();
