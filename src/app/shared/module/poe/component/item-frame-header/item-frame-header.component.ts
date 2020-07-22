import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Item, Language, ItemCategory } from '../../type'

@Component({
  selector: 'app-item-frame-header',
  templateUrl: './item-frame-header.component.html',
  styleUrls: ['./item-frame-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFrameHeaderComponent {
  @Input()
  public item: Item

  @Input()
  public queryItem: Item

  @Input()
  public queryable: boolean

  @Input()
  public language: Language

  public getHeaderClass(item: Item): string {
    const headerClasses: string[] = ['header']

    if (item.name && item.typeId) {
      headerClasses.push('double')
    }

    switch (item.category) {
      case ItemCategory.Prophecy:
        headerClasses.push(item.category)
        break
      default:
        if (item.rarity) {
          headerClasses.push(item.rarity)
        }
        break
    }

    return headerClasses.join(' ')
  }
}
