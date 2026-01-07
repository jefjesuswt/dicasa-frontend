
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { DialogComponent } from '../../../shared/dialog/dialog.component';

@Component({
    selector: 'app-backup',
    standalone: true,
    imports: [CommonModule, DialogComponent],
    templateUrl: './backup.component.html',
})
export class BackupComponent {
    private http = inject(HttpClient);
    private toastService = inject(ToastService);
    private apiUrl = environment.API_URL;

    isDownloading = signal(false);
    isRestoring = signal(false);

    // Dialog state
    showRestoreConfirm = signal(false);
    selectedFile = signal<File | null>(null);

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
                this.toastService.success('Éxito', 'Respaldo descargado correctamente');
            },
            error: (err) => {
                console.error('Download error', err);
                this.isDownloading.set(false);
                this.toastService.error('Error', 'No se pudo descargar el respaldo');
            }
        });
    }

    onFileSelected(event: any) {
        // Reset state
        this.selectedFile.set(null);

        const file = event.target.files[0];
        if (file) {
            // Validate file type simply by extension/type
            if (file.name.endsWith('.json') || file.type === 'application/json') {
                this.selectedFile.set(file);
                this.showRestoreConfirm.set(true);
            } else {
                this.toastService.error('Formato inválido', 'El archivo debe ser un JSON válido.');
            }
            // Clear input value so same file can be selected again if needed
            event.target.value = '';
        }
    }

    cancelRestore() {
        this.showRestoreConfirm.set(false);
        this.selectedFile.set(null);
    }

    confirmRestore() {
        const file = this.selectedFile();
        if (!file) return;

        this.isRestoring.set(true);
        this.showRestoreConfirm.set(false); // Close dialog

        const formData = new FormData();
        formData.append('file', file);

        this.http.post(`${this.apiUrl}/backup/restore`, formData).subscribe({
            next: (res: any) => {
                this.isRestoring.set(false);
                const stats = res.stats;
                this.toastService.success('Restauración Completada', `Colecciones: ${stats.restoredCollections}, Documentos: ${stats.insertedDocs}`);

                if (stats.errors && stats.errors.length > 0) {
                    // Since toast service usually shows one message, maybe log errors or show a warning toast too
                    stats.errors.forEach((err: string) => {
                        console.warn('Backup warning:', err); // Log to console
                        this.toastService.warning('Advertencia', 'Hubo algunos errores menores. Revisa la consola.');
                    });
                }
                this.selectedFile.set(null);
            },
            error: (err) => {
                console.error('Restore error', err);
                this.isRestoring.set(false);
                this.toastService.error('Error Fatal', 'Fallo al restaurar: ' + (err.error?.message || err.message));
                this.selectedFile.set(null);
            }
        });
    }
}
