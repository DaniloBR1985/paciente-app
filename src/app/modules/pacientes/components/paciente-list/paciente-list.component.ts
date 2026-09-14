import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { pacienteService } from '../../../../services/paciente.service';
import { PacienteReadDto } from '../../../../models/paciente.model';

@Component({
  selector: 'app-paciente-list',
  templateUrl: './paciente-list.component.html',
  styleUrls: ['./paciente-list.component.scss']
})
export class PacienteListComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'sobrenome', 'cpf', 'celular', 'convenioNome', 'ativo', 'actions'];
  dataSource: PacienteReadDto[] = [];
  loading = false;
  error?: string;

  constructor(private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = undefined;
    try {
      const res = await pacienteService.list();
      console.log('[PacienteList] response from service:', res);
      if (Array.isArray(res)) {
        this.dataSource = res;
      } else if (res && Array.isArray((res as any).data)) {
        this.dataSource = (res as any).data;
      } else {
        this.dataSource = [];
        console.warn('[PacienteList] resposta inesperada, atribuída lista vazia', res);
      }
      console.log('[PacienteList] dataSource length =', this.dataSource.length);
    } catch (err: any) {
      console.error('Erro ao carregar pacientes', err);
      this.error = err?.response?.data?.message ?? err?.message ?? 'Erro ao carregar pacientes';
      this.snackBar.open(this.error ?? 'Erro ao carregar pacientes', 'Fechar', { duration: 6000 });
    } finally {
      this.loading = false;
    }
  }

  onEdit(id: string): void {
    if (!id) {
      this.snackBar.open('Id de paciente inválido.', 'Fechar', { duration: 4000 });
      return;
    }
    // Navega para a rota de edição do paciente
    this.router.navigate(['/pacientes', id, 'editar']);
  }

  async onInativar(id: string): Promise<void> {
    if (!confirm('Deseja inativar este paciente?')) return;
    try {
      await pacienteService.delete(id);
      this.snackBar.open('Paciente inativado com sucesso.', 'Fechar', { duration: 4000 });
      await this.load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao inativar paciente';
      this.snackBar.open(msg, 'Fechar', { duration: 6000 });
    }
  }
}
