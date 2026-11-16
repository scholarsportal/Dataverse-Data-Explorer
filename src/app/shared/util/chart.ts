import { Theme } from '../../services/theme.service';

export interface ChartColours {
  /** Axis labels, axis titles, the chart title and legend labels */
  text: string;
  grid: string;
}

const CHART_COLOURS: Record<Theme, ChartColours> = {
  light: { text: 'black', grid: '#c8c5d0' },
  dark: { text: 'white', grid: 'white' },
};

// Light is the fail-safe: dark text on a dark page is hard to read, but
// white text on a light page is invisible.
export function chartColours(theme: Theme): ChartColours {
  return CHART_COLOURS[theme] ?? CHART_COLOURS.light;
}

interface Coloured {
  color?: unknown;
}

interface ThemableScale {
  grid?: Coloured;
  ticks?: Coloured;
  title?: Coloured;
}

/** The parts of a Chart.js chart whose colour depends on the theme. */
export interface ThemableChart {
  options: {
    scales?: { x?: ThemableScale; y?: ThemableScale };
    plugins?: { legend?: { labels?: Coloured }; title?: Coloured };
  };
}

/**
 * Colours every piece of text and every gridline of a chart for the given
 * theme. The caller redraws the chart (`chart.update()`) afterwards.
 */
export function applyChartTheme(chart: ThemableChart, theme: Theme): void {
  const { text, grid } = chartColours(theme);
  const { scales, plugins } = chart.options;
  [scales?.x, scales?.y].forEach((scale) => {
    if (!scale) {
      return;
    }
    if (scale.grid) {
      scale.grid.color = grid;
    }
    if (scale.ticks) {
      scale.ticks.color = text;
    }
    if (scale.title) {
      scale.title.color = text;
    }
  });
  if (plugins?.legend?.labels) {
    plugins.legend.labels.color = text;
  }
  if (plugins?.title) {
    plugins.title.color = text;
  }
}
