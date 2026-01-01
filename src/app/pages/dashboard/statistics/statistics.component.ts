import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, ChartData } from "chart.js";
import {
  AnalyticsService,
  DashboardStats,
} from "../../../services/analytics.service";

@Component({
  selector: "app-statistics",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./statistics.component.html",
})
export class StatisticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

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

  // Opciones para Barras
  public barOptions: ChartConfiguration["options"] = {
    ...this.commonOptions,
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

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.analyticsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateCharts(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
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

    // 3. EVOLUCIÓN (Simulación basada en dato real 'totalVisitsMonth')
    // Generamos una curva de 7 días basada en el promedio
    this.generateEvolutionData(data.kpis.totalVisitsMonth);
  }

  private generateEvolutionData(totalMonthlyVisits: number) {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    // Estimación simple: promedio diario con variación aleatoria
    const dailyAvg = Math.floor(totalMonthlyVisits / 30);

    // Generar datos que parezcan "mercado de valores"
    const values = days.map(() => {
      // Variación entre 60% y 140% del promedio para que la curva suba y baje
      const variance = Math.random() * 0.8 + 0.6;
      return Math.floor(dailyAvg * variance);
    });

    this.evolutionData = {
      labels: days,
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
}
