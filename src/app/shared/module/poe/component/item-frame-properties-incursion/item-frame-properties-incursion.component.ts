import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Item, Language } from '../../type'

@Component({
  selector: 'app-item-frame-properties-incursion',
  templateUrl: './item-frame-properties-incursion.component.html',
  styleUrls: ['./item-frame-properties-incursion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFramePropertiesIncursionComponent {
  @Input()
  public item: Item

  @Input()
  public queryItem: Item

  @Input()
  public language: Language

  constructor() { }
}
