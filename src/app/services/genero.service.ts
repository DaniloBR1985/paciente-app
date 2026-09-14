import api from '../core/api.service';
import { GeneroDto } from '../models/genero.model';

class GeneroService {
  list(): Promise<GeneroDto[]> {
    return api.get<GeneroDto[]>('/api/Generos').then(r => r.data);
  }
}

export const generoService = new GeneroService();
