import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'

interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

@Directive({
  selector: '[appAlphaColor]',
})
export class AlphaColorDirective implements OnInit, OnChanges {
  private element: HTMLElement

  @Input('appAlphaColor')
  public stylePropertyNames: string[]

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
      const color = this.parseColor(colorString)
      this.element.style[stylePropertyName] = `rgba(${color.r},${color.g},${color.b},${
        color.a * this.alpha
      })`
    })
  }

  // A magical function copied from here: https://stackoverflow.com/a/21966100
  private parseColor(input: string): RGBA {
    if (input.substr(0, 1) == '#') {
      const collen = (input.length - 1) / 3
      const fact = [17, 1, 0.062272][collen - 1]
      return {
        r: Math.round(parseInt(input.substr(1, collen), 16) * fact),
        g: Math.round(parseInt(input.substr(1 + collen, collen), 16) * fact),
        b: Math.round(parseInt(input.substr(1 + 2 * collen, collen), 16) * fact),
        a: 1,
      }
    } else {
      const colors = input
        .split('(')[1]
        .split(')')[0]
        .split(',')
        .map((x) => +x)
      return {
        r: colors[0],
        g: colors[1],
        b: colors[2],
        a: colors.length == 4 ? colors[3] : 1,
      }
    }
  }
}
