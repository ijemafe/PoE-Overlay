import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { Color, ColorUtils } from '@app/class'

@Directive({
  selector: '[appAlphaColor]',
})
export class AlphaColorDirective implements OnInit, OnChanges {
  private element: HTMLElement

  @Input('appAlphaColor')
  public stylePropertyNames: string[]

  // tslint:disable-next-line:no-input-rename
  @Input('appAlphaColor.alpha')
  public alpha = 1

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  public ngOnInit(): void {
    this.element = this.element || this.elementRef.nativeElement

    this.onChanged()
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.onChanged()
  }

  private onChanged(): void {
    if (!this.element || !this.stylePropertyNames) {
      return
    }

    this.stylePropertyNames.forEach((stylePropertyName) =>
      this.element.style.removeProperty(stylePropertyName)
    )

    const computedStyle = getComputedStyle(this.element)
    this.stylePropertyNames.forEach((stylePropertyName) => {
      const colorString = computedStyle.getPropertyValue(stylePropertyName)
      const color = ColorUtils.fromString(colorString)
      color.a *= this.alpha
      this.element.style[stylePropertyName] = ColorUtils.toRGBA(color)
    })
  }
}
