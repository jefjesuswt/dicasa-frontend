
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-backup',
    standalone: true,
    imports: [CommonModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './backup.component.html',
})
export class BackupComponent {
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private apiUrl = environment.API_URL;

    isDownloading = signal(false);
    isRestoring = signal(false);
    uploadProgress = signal(0);

    downloadBackup() {
        this.isDownloading.set(true);
        this.http.get(`${this.apiUrl}/backup/export`, { responseType: 'blob' }).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `dicasa-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                window.URL.revokeObjectURL(url);
                this.isDownloading.set(false);
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Respaldo descargado correctamente' });
            },
            error: (err) => {
                console.error('Download error', err);
                this.isDownloading.set(false);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el respaldo' });
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.confirmRestore(file);
        }
    }

    confirmRestore(file: File) {
        this.confirmationService.confirm({
            message: 'Esta acción sobrescribirá o actualizará los datos existentes en la base de datos. ¿Estás seguro de que deseas continuar?',
            header: 'Confirmar Restauración',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.restoreBackup(file);
            },
            reject: () => {
                // Clear file input if needed
            }
        });
    }

    restoreBackup(file: File) {
        this.isRestoring.set(true);
        const formData = new FormData();
        formData.append('file', file);

        this.http.post(`${this.apiUrl}/backup/restore`, formData).subscribe({
            next: (res: any) => {
                this.isRestoring.set(false);
                const stats = res.stats;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Restauración Completada',
                    detail: `Colecciones: ${stats.restoredCollections}, Documentos: ${stats.insertedDocs}`
                });

                if (stats.errors && stats.errors.length > 0) {
                    stats.errors.forEach((err: string) => {
                        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: err });
                    });
                }
            },
            error: (err) => {
                console.error('Restore error', err);
                this.isRestoring.set(false);
                this.messageService.add({ severity: 'error', summary: 'Error Fatal', detail: 'Fallo al restaurar el respaldo: ' + (err.error?.message || err.message) });
            }
        });
    }
}
