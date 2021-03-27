import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Currency, CurrencyRange } from '../../type'

@Component({
  selector: 'app-currency-ratio-frame',
  templateUrl: './currency-ratio-frame.component.html',
  styleUrls: ['./currency-ratio-frame.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatioFrameComponent {
  @Input()
  public currency: Currency

  @Input()
  public amount: number

  @Input()
  public numerator: number

  @Input()
  public denominator: number
}
