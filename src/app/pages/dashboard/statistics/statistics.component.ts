import { Component, OnInit, inject, signal, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, ChartData } from "chart.js";
import {
  AnalyticsService,
  DashboardStats,
} from "../../../services/analytics.service";
import { PdfExportService } from "../../../services/pdf-export.service";

@Component({
  selector: "app-statistics",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./statistics.component.html",
})
export class StatisticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  public pdfService = inject(PdfExportService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  // --- OPCIONES VISUALES (Dark Corporate) ---
  public commonOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false, // CRÍTICO para que funcione en móvil
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { family: "Courier New" } },
        position: "bottom",
      },
    },
  };

  // Opciones para la gráfica de "Bolsa" (Línea de evolución)
  public evolutionOptions: ChartConfiguration["options"] = {
    ...this.commonOptions,
    elements: {
      line: { tension: 0.4 }, // Curvas suaves
      point: { radius: 2, hoverRadius: 5 },
    },
    scales: {
      x: {
        grid: { color: "rgba(100, 116, 139, 0.1)" },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(100, 116, 139, 0.1)" },
        ticks: { color: "#64748b" },
      },
    },
    plugins: { legend: { display: false } }, // Sin leyenda para look limpio
  };

  // Opciones para Barras (General)
  public barOptions: ChartConfiguration["options"] = {
    ...this.commonOptions,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
      y: {
        grid: { color: "rgba(100, 116, 139, 0.1)" },
        ticks: { color: "#64748b" },
        beginAtZero: true,
      },
    },
  };

  // Opciones específicas para Rendimiento de Asesores (Barras Comparativas)
  public agentBarOptions: ChartConfiguration["options"] = {
    ...this.barOptions,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: "#94a3b8" }
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
      y: {
        grid: { color: "rgba(100, 116, 139, 0.1)" },
        ticks: { color: "#64748b" },
        beginAtZero: true,
      },
    },
  };

  // Datos de las gráficas
  public inventoryData: ChartData<"doughnut"> = { labels: [], datasets: [] };
  public funnelData: ChartData<"bar"> = { labels: [], datasets: [] };
  public evolutionData: ChartData<"line"> = { labels: [], datasets: [] };
  public agentPerformanceData: ChartData<"bar"> = { labels: [], datasets: [] };

  // Estados de ordenamiento
  public sortedAgents: any[] = [];

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.analyticsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateCharts(data);
        this.applyAgentSort(); // Inicializar lista ordenada
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private applyAgentSort() {
    const data = this.stats();
    if (!data) return;

    // Sort by Conversion Rate (High to Low) as requested for Ranking
    this.sortedAgents = [...data.charts.topAgents].sort((a, b) => {
      return b.conversionRate - a.conversionRate;
    });
  }

  private updateCharts(data: DashboardStats) {
    // 1. INVENTARIO (Dona)
    // Mapeo de IDs técnicos a etiquetas legibles
    const labels = data.charts.inventory.map((i) => {
      const map: Record<string, string> = {
        sale: "Venta",
        rent: "Alquiler",
        sold: "Vendidas",
        rented: "Alquiladas",
      };
      return map[i._id] || i._id.toUpperCase();
    });
    const counts = data.charts.inventory.map((i) => i.count);

    this.inventoryData = {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b"], // Palette: Sky, Indigo, Emerald, Amber
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    };

    // 2. FUNNEL (Barras Comparativas)
    this.funnelData = {
      labels: ["Total Solicitudes", "Citas Concretadas"],
      datasets: [
        {
          data: [
            data.charts.schedulingFunnel.total,
            data.charts.schedulingFunnel.completed,
          ],
          label: "Volumen",
          backgroundColor: ["#38bdf8", "#10b981"],
          borderRadius: 4,
          barThickness: 50,
        },
      ],
    };

    // 3. EVOLUCIÓN (Dato Real Last 7 Days)
    // Usamos los datos reales del backend
    this.updateEvolutionChart(data.charts.visitsTrend);

    // 4. RENDIMIENTO ASESORES (Barras Comparativas)
    this.agentPerformanceData = {
      labels: data.charts.topAgents.map(a => a.name.split(' ')[0]),
      datasets: [
        {
          data: data.charts.topAgents.map(a => a.totalAppointments),
          label: 'Total Citas',
          backgroundColor: '#38bdf8',
          borderRadius: 2,
        },
        {
          data: data.charts.topAgents.map(a => a.completedAppointments),
          label: 'Concretadas',
          backgroundColor: '#10b981',
          borderRadius: 2,
        }
      ]
    };
  }

  private updateEvolutionChart(trendData: { date: string; count: number }[]) {
    // Si no hay datos (array vacío), poner días genéricos o manejar empty state
    // Pero el backend siempre devuelve algo (aunque sea una lista vacía, el front debe manejarlo).
    // Aquí asumimos que queremos mostrar lo que venga.

    // Formatear fechas a algo corto (e.g. "Lun 12")
    const labels = trendData.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    });

    const values = trendData.map((d) => d.count);

    this.evolutionData = {
      labels: labels,
      datasets: [
        {
          data: values,
          label: "Usuarios Únicos",
          borderColor: "#38bdf8", // Línea Sky
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(56, 189, 248, 0.3)");
            gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");
            return gradient;
          },
          fill: true,
          borderWidth: 2,
          pointBackgroundColor: "#0ea5e9",
          pointBorderColor: "#fff",
        },
      ],
    };
  }

  async exportReport() {
    await this.pdfService.exportToPdf(
      'stats-content-print-target',
      'Reporte Estadísticas Dicasa'
    );
  }
}
