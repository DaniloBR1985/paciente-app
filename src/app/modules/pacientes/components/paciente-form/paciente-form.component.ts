import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pacienteService } from '../../../../services/paciente.service';
import { generoService } from '../../../../services/genero.service';
import { convenioService } from '../../../../services/convenio.service';
import { PacienteCreateDto, PacienteReadDto } from '../../../../models/paciente.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-paciente-form',
  templateUrl: './paciente-form.component.html',
  styleUrls: ['./paciente-form.component.scss']
})
export class PacienteFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  saving = false;
  isEdit = false;
  pacienteId?: string;
  generos: Array<{ id: number; nome: string }> = [];
  convenios: Array<{ id: number; nome: string }> = [];
  ufs: Array<{ sigla: string; nome: string }> = [];
  private routeSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUfs();
    this.buildForm();
    this.loadSelects();

    // subscribe para garantir que qualquer mudança no param seja processada
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.pacienteId = id;
        this.loadPaciente(id);
      } else {
        this.isEdit = false;
        this.pacienteId = undefined;
        this.form.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadUfs(): void {
    this.ufs = [
      { sigla: 'AC', nome: 'Acre' },
      { sigla: 'AL', nome: 'Alagoas' },
      { sigla: 'AP', nome: 'Amapá' },
      { sigla: 'AM', nome: 'Amazonas' },
      { sigla: 'BA', nome: 'Bahia' },
      { sigla: 'CE', nome: 'Ceará' },
      { sigla: 'DF', nome: 'Distrito Federal' },
      { sigla: 'ES', nome: 'Espírito Santo' },
      { sigla: 'GO', nome: 'Goiás' },
      { sigla: 'MA', nome: 'Maranhão' },
      { sigla: 'MT', nome: 'Mato Grosso' },
      { sigla: 'MS', nome: 'Mato Grosso do Sul' },
      { sigla: 'MG', nome: 'Minas Gerais' },
      { sigla: 'PA', nome: 'Pará' },
      { sigla: 'PB', nome: 'Paraíba' },
      { sigla: 'PR', nome: 'Paraná' },
      { sigla: 'PE', nome: 'Pernambuco' },
      { sigla: 'PI', nome: 'Piauí' },
      { sigla: 'RJ', nome: 'Rio de Janeiro' },
      { sigla: 'RN', nome: 'Rio Grande do Norte' },
      { sigla: 'RS', nome: 'Rio Grande do Sul' },
      { sigla: 'RO', nome: 'Rondônia' },
      { sigla: 'RR', nome: 'Roraima' },
      { sigla: 'SC', nome: 'Santa Catarina' },
      { sigla: 'SP', nome: 'São Paulo' },
      { sigla: 'SE', nome: 'Sergipe' },
      { sigla: 'TO', nome: 'Tocantins' }
    ];
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      sobrenome: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required, this.dataNascimentoNaoFuturaValidator]],
      generoId: [null, [Validators.required]],
      cpf: ['', [this.cpfFormatValidator]],
      rg: ['', [Validators.required]],
      ufDoRG: ['', [Validators.required]],
      email: ['', [this.emailValidator]],
      celular: [''],
      telefoneFixo: [''],
      convenioId: [null],
      numeroCarteirinha: [''],
      validadeCarteirinha: ['', [this.validadeCarteirinhaValidator]]
    }, { validators: [this.atLeastOnePhoneValidator] });
  }

  private async loadSelects(): Promise<void> {
    this.loading = true;
    try {
      this.generos = await generoService.list();
      this.convenios = await convenioService.list();
    } catch (err: any) {
      console.error(err);
      this.snackBar.open('Erro ao carregar dados auxiliares.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  private async loadPaciente(id: string): Promise<void> {
    this.loading = true;
    try {
      const p: PacienteReadDto = await pacienteService.getById(id);
      console.log('[PacienteForm] paciente recebido:', p);

      // normalizar data para input type="date" (yyyy-MM-dd)
      let dataNascimentoVal = p.dataNascimento ?? '';
      if (dataNascimentoVal) {
        const d = new Date(dataNascimentoVal);
        if (!isNaN(d.getTime())) {
          dataNascimentoVal = d.toISOString().slice(0, 10);
        } else if (typeof p.dataNascimento === 'string' && p.dataNascimento.indexOf('T') > -1) {
          dataNascimentoVal = p.dataNascimento.split('T')[0];
        }
      }

      this.form.patchValue({
        nome: p.nome ?? '',
        sobrenome: p.sobrenome ?? '',
        dataNascimento: dataNascimentoVal,
        generoId: p.generoId ?? null,
        cpf: p.cpf ?? '',
        rg: p.rg ?? '',
        ufDoRG: p.ufDoRG ?? '',
        email: p.email ?? '',
        celular: p.celular ?? '',
        telefoneFixo: p.telefoneFixo ?? '',
        convenioId: p.convenioId ?? null,
        numeroCarteirinha: p.numeroCarteirinha ?? '',
        validadeCarteirinha: p.validadeCarteirinha ?? ''
      });

      // força atualização visual de erros se houver
      this.form.markAsPristine();
      this.form.markAsUntouched();
    } catch (err: any) {
      console.error('[PacienteForm] erro ao carregar paciente', err);
      const message = err?.message ?? err?.response?.data?.message ?? 'Erro ao carregar paciente.';
      this.snackBar.open(message, 'Fechar', { duration: 6000 });
      // NÃO navegar automaticamente para facilitar debug — comente caso queira redirecionar
      // this.router.navigate(['/pacientes']);
    } finally {
      this.loading = false;
    }
  }

  // Helpers / Validators

  private sanitizeDigits(value?: string | null): string {
    if (!value) return '';
    return (value || '').toString().replace(/\D+/g, '');
  }

  private cpfFormatValidator = (control: AbstractControl): ValidationErrors | null => {
    const v = this.sanitizeDigits(control.value);
    if (!v) return null;
    if (v.length !== 11 || !this.isCpfValid(v)) {
      return { cpfInvalido: true };
    }
    return null;
  };

  private isCpfValid(cpf: string): boolean {
    if (!cpf) return false;
    cpf = cpf.replace(/\D+/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    const calc = (t: number) => {
      let sum = 0;
      for (let i = 0; i < t - 1; i++) {
        sum += parseInt(cpf.charAt(i), 10) * (t - i);
      }
      const d = ((sum * 10) % 11) % 10;
      return d;
    };

    const d1 = calc(10);
    const d2 = calc(11);
    return d1 === parseInt(cpf.charAt(9), 10) && d2 === parseInt(cpf.charAt(10), 10);
  }

  private emailValidator = (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value || '').toString().trim();
    if (!v) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(v) ? null : { emailInvalido: true };
  };

  private dataNascimentoNaoFuturaValidator = (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (!v) return null;
    const d = new Date(v);
    const hoje = new Date();
    d.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    return d > hoje ? { dataFutura: true } : null;
  };

  private atLeastOnePhoneValidator = (group: AbstractControl): ValidationErrors | null => {
    const celular = this.sanitizeDigits(group.get('celular')?.value);
    const fixo = this.sanitizeDigits(group.get('telefoneFixo')?.value);
    const ok = (celular && celular.length >= 8) || (fixo && fixo.length >= 8);
    return ok ? null : { telefoneObrigatorio: true };
  };

  private validadeCarteirinhaValidator = (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value || '').toString().trim();
    if (!v) return null;
    const re = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return re.test(v) ? null : { validadeInvalida: true };
  };

  // Apply server validation errors to form controls when backend returns structured errors
  private applyServerErrors(serverData: any): void {
    if (!serverData) return;
    const errors = serverData.errors ?? serverData;
    if (errors && typeof errors === 'object') {
      for (const key of Object.keys(errors)) {
        const control = this.form.get(this.mapServerFieldToFormControl(key));
        const msgs = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
        if (control) {
          control.setErrors({ server: msgs.join(' • ') });
        }
      }
    }
  }

  private mapServerFieldToFormControl(serverField: string): string {
    const map: Record<string,string> = {
      'Nome': 'nome',
      'Sobrenome': 'sobrenome',
      'DataNascimento': 'dataNascimento',
      'CPF': 'cpf',
      'Celular': 'celular',
      'TelefoneFixo': 'telefoneFixo',
      'Email': 'email',
      'ConvenioId': 'convenioId',
      'GeneroId': 'generoId',
      'UFDoRG': 'ufDoRG'
    };
    return map[serverField] ?? serverField.charAt(0).toLowerCase() + serverField.slice(1);
  }

  // Submissão com verificação básica de unicidade de CPF
  async submit(): Promise<void> {
    // força mostrar erros locais
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.snackBar.open('Corrija os erros do formulário antes de salvar.', 'Fechar', { duration: 4000 });
      return;
    }

    const raw = this.form.value;
    const dto: PacienteCreateDto = {
      nome: (raw.nome || '').toString().trim(),
      sobrenome: (raw.sobrenome || '').toString().trim(),
      dataNascimento: raw.dataNascimento,
      generoId: raw.generoId ?? null,
      cpf: this.sanitizeDigits(raw.cpf) || null,
      rg: raw.rg || null,
      ufDoRG: raw.ufDoRG || null,
      email: raw.email || null,
      celular: this.sanitizeDigits(raw.celular) || null,
      telefoneFixo: this.sanitizeDigits(raw.telefoneFixo) || null,
      convenioId: raw.convenioId ?? null,
      numeroCarteirinha: raw.numeroCarteirinha || null,
      validadeCarteirinha: raw.validadeCarteirinha || null
    };

    // verificação básica de unicidade de CPF (consulta lista atual)
    if (dto.cpf) {
      try {
        const all = await pacienteService.list();
        const cpfSan = this.sanitizeDigits(dto.cpf);
        const found = all.find(p => (p.cpf ?? '').toString().replace(/\D+/g, '') === cpfSan);
        if (found) {
          if (!this.isEdit || (this.isEdit && found.id !== this.pacienteId)) {
            // marca erro e retorna
            this.cpf?.setErrors({ cpfDuplicado: true });
            this.snackBar.open('Já existe paciente com o mesmo CPF.', 'Fechar', { duration: 6000 });
            return;
          }
        }
      } catch (err) {
        // se falhar a verificação, continua e deixa backend validar unicidade
        console.warn('Não foi possível verificar duplicidade de CPF localmente', err);
      }
    }

    this.saving = true;
    try {
      if (this.isEdit && this.pacienteId) {
        await pacienteService.update(this.pacienteId, dto);
        this.snackBar.open('Paciente atualizado com sucesso.', 'Fechar', { duration: 4000 });
      } else {
        await pacienteService.create(dto);
        this.snackBar.open('Paciente criado com sucesso.', 'Fechar', { duration: 4000 });
      }
      this.router.navigate(['/pacientes']);
    } catch (err: any) {
      console.error('Salvar paciente erro completo:', err);
      const resp = err?.response?.data ?? err?.data ?? null;
      if (resp) {
        const mainMsg = resp.message ?? resp.title ?? err.message;
        if (mainMsg) this.snackBar.open(mainMsg, 'Fechar', { duration: 6000 });
        this.applyServerErrors(resp);
      } else {
        const msg = err?.message ?? 'Erro ao salvar paciente.';
        this.snackBar.open(msg, 'Fechar', { duration: 6000 });
      }
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/pacientes']);
  }

  // Helpers para template
  get nome() { return this.form.get('nome'); }
  get sobrenome() { return this.form.get('sobrenome'); }
  get cpf() { return this.form.get('cpf'); }
  get email() { return this.form.get('email'); }
  get dataNascimento() { return this.form.get('dataNascimento'); }
  get ufDoRG() { return this.form.get('ufDoRG'); }
  get rg() { return this.form.get('rg'); }
}
