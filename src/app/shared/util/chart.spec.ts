import { applyChartTheme, chartColours, ThemableChart } from './chart';
import { Theme } from '../../services/theme.service';

describe('chart theme colours (issues #137, #157)', () => {
  it('uses dark text and a soft grid on a light page', () => {
    expect(chartColours('light')).toEqual({ text: 'black', grid: '#c8c5d0' });
  });

  it('uses white text and a white grid on a dark page', () => {
    expect(chartColours('dark')).toEqual({ text: 'white', grid: 'white' });
  });

  it('falls back to the light colours for a value that is not a theme', () => {
    expect(chartColours('unknown' as Theme)).toEqual(chartColours('light'));
  });

  describe('applyChartTheme', () => {
    function chart(): ThemableChart {
      return {
        options: {
          scales: {
            x: { grid: {}, ticks: {}, title: {} },
            y: { grid: {}, ticks: {}, title: {} },
          },
          plugins: { legend: { labels: {} }, title: {} },
        },
      };
    }

    it('colours every axis, title and legend label', () => {
      const target = chart();
      applyChartTheme(target, 'dark');
      expect(target.options).toEqual({
        scales: {
          x: {
            grid: { color: 'white' },
            ticks: { color: 'white' },
            title: { color: 'white' },
          },
          y: {
            grid: { color: 'white' },
            ticks: { color: 'white' },
            title: { color: 'white' },
          },
        },
        plugins: {
          legend: { labels: { color: 'white' } },
          title: { color: 'white' },
        },
      });
    });

    it('replaces the colours of a previous theme', () => {
      const target = chart();
      applyChartTheme(target, 'dark');
      applyChartTheme(target, 'light');
      expect(target.options.scales?.x?.ticks?.color).toBe('black');
      expect(target.options.scales?.y?.grid?.color).toBe('#c8c5d0');
      expect(target.options.plugins?.title?.color).toBe('black');
    });

    it('tolerates a chart without scales, a title or a legend', () => {
      const bare: ThemableChart = { options: {} };
      expect(() => applyChartTheme(bare, 'light')).not.toThrow();
      const partial: ThemableChart = { options: { scales: { x: {} } } };
      expect(() => applyChartTheme(partial, 'dark')).not.toThrow();
    });
  });
});
