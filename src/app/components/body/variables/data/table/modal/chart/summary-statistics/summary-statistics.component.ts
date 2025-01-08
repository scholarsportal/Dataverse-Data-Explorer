// Path: src/app/components/body/variables/data/table/modal/chart/summary-statistics/summary-statistics.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SummaryStatistics } from 'src/app/new.state/ui/ui.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-summary-statistics',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './summary-statistics.component.html',
  styleUrl: './summary-statistics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryStatisticsComponent {
  summaryStats = input.required<SummaryStatistics>();

  mode = computed(() => {
    return this.summaryStats().mode;
  });

  minimum = computed(() => {
    return this.summaryStats().minimum;
  });

  standardDeviation = computed(() => {
    return this.summaryStats().standardDeviation;
  });

  totalValidCount = computed(() => {
    return this.summaryStats().totalValidCount;
  });

  totalInvalidCount = computed(() => {
    return this.summaryStats().totalInvalidCount;
  });

  mean = computed(() => {
    return this.summaryStats().mean;
  });

  maximum = computed(() => {
    return this.summaryStats().maximum;
  });

  median = computed(() => {
    return this.summaryStats().median;
  });
}
