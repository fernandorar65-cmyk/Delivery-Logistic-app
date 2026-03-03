import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';

export interface DashboardKpiCard {
  title: string;
  value: string | number;
  changePercent: number;
  changePositive: boolean;
  periodOption: { label: string; value: string };
  chartLabels: string[];
  chartData: number[];
  chartColor?: string;
  /** Datos por período (day, week, month). Si existe, el gráfico usa el seleccionado en periodOption. */
  chartDataByPeriod?: Record<string, { labels: string[]; data: number[] }>;
}

/** Plugin Chart.js: líneas verticales por punto + resaltado que sigue al mouse con transición suave. */
const highlightPointPlugin = {
  id: 'highlightPoint',
  afterEvent(
    chart: Chart,
    args: { event: { x: number | null; y: number | null; type: string }; replay?: boolean }
  ) {
    if (args.replay) return;
    const event = args.event;
    const meta = chart.getDatasetMeta(0);
    const dataLen = meta?.data?.length ?? 0;
    if (dataLen === 0) return;

    const state = chart as Chart & {
      _highlightPointIndex?: number | null;
      _highlightCurrentX?: number;
      _highlightCurrentY?: number;
      _highlightAnimId?: number;
    };

    if (event.type === 'mouseout' || event.type === 'mouseleave') {
      state._highlightPointIndex = null;
      state._highlightCurrentX = undefined;
      state._highlightCurrentY = undefined;
      if (state._highlightAnimId != null) {
        cancelAnimationFrame(state._highlightAnimId);
        state._highlightAnimId = undefined;
      }
      chart.update('none');
      return;
    }

    if (event.type === 'mousemove' && chart.scales?.['x'] != null && event['x'] != null) {
      const xScale = chart.scales['x'];
      const x = event['x'];
      const left = chart.chartArea?.left ?? 0;
      const right = chart.chartArea?.right ?? chart.width;
      if (x < left || x > right) {
        state._highlightPointIndex = null;
        chart.update('none');
        return;
      }
      const value = xScale.getValueForPixel(x);
      const index = Math.round(Number(value));
      const clamped = Math.max(0, Math.min(index, dataLen - 1));
      state._highlightPointIndex = clamped;
      chart.update('none');
    }
  },
  afterDraw(chart: Chart) {
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const ctx = chart.ctx;
    const bottom = chart.chartArea?.bottom ?? chart.height;
    const opts = (chart.options.plugins as Record<string, unknown>)?.['highlightPoint'] as
      | { valueFormat?: 'currency' | 'number' }
      | undefined;
    const valueFormat = opts?.valueFormat ?? 'number';
    const state = chart as Chart & {
      _highlightPointIndex?: number | null;
      _highlightCurrentX?: number;
      _highlightCurrentY?: number;
      _highlightAnimId?: number;
    };
    const targetIndex = state._highlightPointIndex;

    ctx.save();

    // 1) Líneas verticales punteadas desde cada punto hasta el eje X (siempre visibles)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    for (let i = 0; i < meta.data.length; i++) {
      const pt = meta.data[i] as { x: number; y: number };
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x, bottom);
      ctx.stroke();
    }

    // 2) Punto bajo el mouse: transición suave, círculo con borde blanco, línea y burbuja
    if (targetIndex != null && targetIndex >= 0 && targetIndex < meta.data.length) {
      const targetPoint = meta.data[targetIndex] as { x: number; y: number };
      const targetX = targetPoint.x;
      const targetY = targetPoint.y;

      const LERP = 0.22;
      let currX = state._highlightCurrentX;
      let currY = state._highlightCurrentY;
      if (currX == null || currY == null) {
        currX = targetX;
        currY = targetY;
      } else {
        currX += (targetX - currX) * LERP;
        currY += (targetY - currY) * LERP;
      }
      state._highlightCurrentX = currX;
      state._highlightCurrentY = currY;

      const dist = Math.hypot(targetX - currX, targetY - currY);
      if (dist > 0.5 && state._highlightAnimId == null) {
        state._highlightAnimId = requestAnimationFrame(() => {
          state._highlightAnimId = undefined;
          chart.update('none');
        });
      }

      const x = currX;
      const y = currY;
      const data = chart.data.datasets[0]?.data as number[] | undefined;
      const rawValue = data?.[targetIndex] ?? 0;
      const label =
        valueFormat === 'currency'
          ? '$' + Number(rawValue).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : Number(rawValue).toLocaleString('es-ES');

      // Línea vertical del punto (desde posición actual interpolada)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, bottom);
      ctx.stroke();

      // Círculo: relleno negro + borde blanco (estilo marcador)
      const radius = 6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fill();
      ctx.strokeStyle = 'rgb(255, 255, 255)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Burbuja con el valor
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      const metrics = ctx.measureText(label);
      const paddingH = 6;
      const w = metrics.width + paddingH * 2;
      const h = 18;
      const gap = 8;
      const top = chart.chartArea?.top ?? 0;
      let by = y - h - gap;
      if (by < top) by = y + gap;
      const bx = x - w / 2;
      const r = 3;

      ctx.fillStyle = 'rgba(55, 65, 81, 0.96)';
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + w - r, by);
      ctx.quadraticCurveTo(bx + w, by, bx + w, by + r);
      ctx.lineTo(bx + w, by + h - r);
      ctx.quadraticCurveTo(bx + w, by + h, bx + w - r, by + h);
      ctx.lineTo(bx + r, by + h);
      ctx.quadraticCurveTo(bx, by + h, bx, by + h - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, by + h / 2);
    }

    ctx.restore();
  }
};

Chart.register(highlightPointPlugin);

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TagModule, ChartModule, SelectModule],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.css'
})
export class DashboardMetricsComponent {
  @Input({ required: true }) cards!: DashboardKpiCard[];
  @Input() periodOptions: { label: string; value: string }[] = [
    { label: 'Diario', value: 'day' },
    { label: 'Semanal', value: 'week' },
    { label: 'Mensual', value: 'month' }
  ];

  /** Formato del valor en la burbuja: currency para "Valor promedio", number para el resto. */
  getValueFormat(card: DashboardKpiCard): 'currency' | 'number' {
    const title = (card.title || '').toLowerCase();
    return title.includes('valor promedio') || title.includes('order value') ? 'currency' : 'number';
  }

  /** Calcula min/max del eje Y para que la curva ocupe más altura (no anclada a 0). */
  getYScaleBounds(card: DashboardKpiCard): { min: number; max?: number } {
    const periodKey = card.periodOption?.value ?? 'week';
    const byPeriod = card.chartDataByPeriod?.[periodKey];
    const data = byPeriod?.data ?? card.chartData ?? [];
    if (data.length === 0) return { min: 0 };
    const dataMin = Math.min(...data);
    const dataMax = Math.max(...data);
    const range = dataMax - dataMin;
    const padding = range > 0 ? range * 0.15 : Math.abs(dataMin) * 0.2 || 1;
    return {
      min: Math.max(0, dataMin - padding),
      max: dataMax + padding
    };
  }

  getChartOptions(card: DashboardKpiCard) {
    const yBounds = this.getYScaleBounds(card);
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 28, bottom: 4, left: 2, right: 2 }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        highlightPoint: {
          valueFormat: this.getValueFormat(card)
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            maxRotation: 45,
            minRotation: 0,
            maxTicksLimit: 12,
            padding: 4,
            autoSkip: true
          }
        },
        y: {
          display: false,
          min: yBounds.min,
          max: yBounds.max
        }
      },
      elements: {
        line: { tension: 0.35 },
        point: { radius: 0 }
      }
    };
  }

  getChartData(card: DashboardKpiCard) {
    const periodKey = card.periodOption?.value ?? 'week';
    const byPeriod = card.chartDataByPeriod?.[periodKey];
    const labels = byPeriod?.labels ?? card.chartLabels ?? [];
    const data = byPeriod?.data ?? card.chartData ?? [];
    const c = card.chartColor || '99, 102, 241';

    return {
      labels,
      datasets: [
        {
          data,
          fill: true,
          borderColor: `rgb(${c})`,
          backgroundColor: `rgba(${c}, 0.15)`,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
    };
  }
}
