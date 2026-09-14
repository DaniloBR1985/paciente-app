import api from '../core/api.service';
import { ConvenioDto } from '../models/convenio.model';

class ConvenioService {
  list(): Promise<ConvenioDto[]> {
    return api.get<ConvenioDto[]>('/api/Convenios').then(r => r.data);
  }
}

export const convenioService = new ConvenioService();
