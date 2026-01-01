import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AnalyticsService, ActionLog, PaginatedActionLogs } from "../../../services/analytics.service";
import { finalize } from "rxjs";

@Component({
    selector: "dashboard-action-logs",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
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

    // Filters
    filterAction = "";
    filterUserId = "";

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        this.loading.set(true);

        this.analyticsService
            .getActionLogs(
                this.currentPage,
                this.itemsPerPage,
                this.filterAction || undefined,
                this.filterUserId || undefined
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

    applyFilters(): void {
        this.currentPage = 1; // Reset to first page when filtering
        this.loadLogs();
    }

    clearFilters(): void {
        this.filterAction = "";
        this.filterUserId = "";
        this.currentPage = 1;
        this.loadLogs();
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
            CREATE_PROPERTY: "text-emerald-500",
            UPDATE_PROPERTY: "text-sky-500",
            DELETE_PROPERTY: "text-red-500",
            CREATE_USER: "text-purple-500",
            UPDATE_USER: "text-indigo-500",
            DELETE_USER: "text-orange-500",
            LOGIN: "text-cyan-500",
            LOGOUT: "text-slate-500",
        };

        return actionMap[action] || "text-[var(--text-secondary)]";
    }
}
