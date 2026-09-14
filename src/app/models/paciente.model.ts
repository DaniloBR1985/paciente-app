export interface PacienteCreateDto {
  nome: string;
  sobrenome: string;
  dataNascimento: string; // ISO yyyy-MM-dd
  generoId?: number | null;
  cpf?: string | null;
  rg?: string | null;
  ufDoRG?: string | null;
  email?: string | null;
  celular?: string | null;
  telefoneFixo?: string | null;
  convenioId?: number | null;
  numeroCarteirinha?: string | null;
  validadeCarteirinha?: string | null;
}

export interface PacienteReadDto extends PacienteCreateDto {
  id: string;
  generoNome?: string | null;
  convenioNome?: string | null;
  ativo: boolean;
}
