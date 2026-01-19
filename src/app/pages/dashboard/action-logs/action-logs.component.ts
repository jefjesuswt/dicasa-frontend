import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AnalyticsService, ActionLog, PaginatedActionLogs } from "../../../services/analytics.service";
import { finalize } from "rxjs";
import { SearchBarComponent, SearchParams } from "../../../shared/search-bar/search-bar.component";

@Component({
    selector: "dashboard-action-logs",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SearchBarComponent], // Add SearchBarComponent
    templateUrl: "./action-logs.component.html",
})
export class ActionLogsComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    loading = signal(true);
    logs = signal<ActionLog[]>([]);

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;
    totalLogs = 0;
    totalPages = 0;

    // Sort
    sortBy = "createdAt";
    sortOrder: "asc" | "desc" = "desc";

    // Current filters for pagination
    currentFilters: SearchParams = {
        query: "",
        selectedValue: "all"
    };

    // Action Options (Spanish Mapping for UI)
    actionOptions = [
        { label: "Crear Propiedad", value: "CREATE_PROPERTY" },
        { label: "Actualizar Propiedad", value: "UPDATE_PROPERTY" },
        { label: "Borrar Propiedad", value: "DELETE_PROPERTY" },
        { label: "Eliminar Propiedad", value: "REMOVE_PROPERTY" },
        { label: "Crear Usuario", value: "CREATE_USER" },
        { label: "Actualizar Usuario", value: "UPDATE_USER" },
        { label: "Borrar Usuario", value: "DELETE_USER" },
        { label: "Eliminar Usuario", value: "REMOVE_USER" },
        { label: "Crear Cita", value: "CREATE_APPOINTMENT" },
        { label: "Actualizar Cita", value: "UPDATE_APPOINTMENT" },
        { label: "Borrar Cita", value: "DELETE_APPOINTMENT" },
        { label: "Eliminar Cita", value: "REMOVE_APPOINTMENT" },
        { label: "Asignar Agente", value: "ASSIGN_AGENT" },
        { label: "Reasignar Agente", value: "REASSIGN_AGENT" },
        { label: "Iniciar Sesión", value: "LOGIN" },
        { label: "Cerrar Sesión", value: "LOGOUT" },
    ];

    sortOptions = [
        { label: "Más Recientes", value: "createdAt", order: "desc" },
        { label: "Más Antiguos", value: "createdAt", order: "asc" },
    ];

    ngOnInit(): void {
        this.loadLogs();
    }

    onSearch(params: SearchParams): void {
        this.currentFilters = params;
        this.currentPage = 1;

        // Extract sort info if present
        if (params.sortBy) {
            this.sortBy = params.sortBy;
            this.sortOrder = params.sortOrder || "desc";
        }

        this.loadLogs();
    }

    loadLogs(): void {
        this.loading.set(true);

        // Map SearchParams to API params
        const action = this.currentFilters.selectedValue !== "all" ? this.currentFilters.selectedValue : undefined;
        // Search query maps to userName.
        // We removed the ID search heuristic as per user request.
        const query = this.currentFilters.query ? this.currentFilters.query.trim() : "";
        const userName = query;
        const logId: string | undefined = undefined;

        this.analyticsService
            .getActionLogs(
                this.currentPage,
                this.itemsPerPage,
                action,
                undefined, // userId input removed
                userName || undefined,
                logId,
                this.currentFilters.startDate,
                this.currentFilters.endDate,
                this.sortBy,
                this.sortOrder
            )
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (response: PaginatedActionLogs) => {
                    this.logs.set(response.data);
                    this.totalLogs = response.total;
                    this.totalPages = response.totalPages;
                },
                error: (err) => {
                    console.error("Error loading action logs:", err);
                },
            });
    }

    clearFilters(): void {
        // Handled by SearchBarComponent internally usually, or we just reload
        // But SearchComponent emits new empty params on clear
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }
        this.currentPage = page;
        this.loadLogs();
    }

    getActionBadgeClass(action: string): string {
        const actionMap: { [key: string]: string } = {
            // Properties
            CREATE_PROPERTY: "text-emerald-500",
            UPDATE_PROPERTY: "text-sky-500",
            DELETE_PROPERTY: "text-red-500",
            REMOVE_PROPERTY: "text-red-500",
            // Users
            CREATE_USER: "text-purple-500",
            UPDATE_USER: "text-indigo-500",
            DELETE_USER: "text-orange-500",
            REMOVE_USER: "text-orange-500",
            // Appointments
            CREATE_APPOINTMENT: "text-emerald-500",
            UPDATE_APPOINTMENT: "text-sky-500",
            DELETE_APPOINTMENT: "text-red-500",
            REMOVE_APPOINTMENT: "text-red-500",
            // Agent
            ASSIGN_AGENT: "text-teal-500",
            REASSIGN_AGENT: "text-amber-500",
            // Auth
            LOGIN: "text-cyan-500",
            LOGOUT: "text-slate-500",
        };

        return actionMap[action] || "text-[var(--text-secondary)]";
    }

    getActionLabel(action: string): string {
        const labelMap: { [key: string]: string } = {
            // Properties
            CREATE_PROPERTY: "Crear Propiedad",
            UPDATE_PROPERTY: "Actualizar Propiedad",
            DELETE_PROPERTY: "Borrar Propiedad",
            REMOVE_PROPERTY: "Eliminar Propiedad",
            // Users
            CREATE_USER: "Crear Usuario",
            UPDATE_USER: "Actualizar Usuario",
            DELETE_USER: "Borrar Usuario",
            REMOVE_USER: "Eliminar Usuario",
            // Appointments
            CREATE_APPOINTMENT: "Crear Cita",
            UPDATE_APPOINTMENT: "Actualizar Cita",
            DELETE_APPOINTMENT: "Borrar Cita",
            REMOVE_APPOINTMENT: "Eliminar Cita",
            // Agent
            REASSIGN_AGENT: "Reasignar Agente",
            ASSIGN_AGENT: "Asignar Agente",
            // Auth
            LOGIN: "Iniciar Sesión",
            LOGOUT: "Cerrar Sesión",
        };

        return labelMap[action] || action;
    }
}
