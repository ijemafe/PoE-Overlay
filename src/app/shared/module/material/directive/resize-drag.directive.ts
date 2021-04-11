import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { Point } from '@app/type'
import { Rectangle } from 'electron';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  RESIZING = 2,
  MOVE = 3,
  MOVING = 4,
}

interface AppliedBounds {
  x: boolean,
  y: boolean,
  width: boolean,
  height: boolean,
}

@Directive({
  selector: '[appResizeDrag]',
})
export class ResizeDragDirective implements OnInit, OnDestroy {
  private element: HTMLElement
  private resizeAnchorContainer: HTMLElement

  private status: Status = Status.OFF;

  private mouseDownPosition: Point
  private mouseDownBounds: Rectangle

  @Input('appResizeDrag')
  public rootElementSelector: string

  @Input('ardDisabled')
  public disabled: boolean

  @Input('ardBounds')
  public bounds: Rectangle

  @Input('ardDragThreshold')
  public resizeDragThreshold = 5

  @Input('ardResizeWidth')
  public resizeWidth = 8

  @Input('ardAppliedBounds')
  public appliedBounds: AppliedBounds = { x: true, y: true, width: true, height: true }

  @Input('ardAppliedBounds.x')
  public set appliedBoundsX(val: boolean) {
    this.appliedBounds.x = val
  }

  @Input('ardAppliedBounds.y')
  public set appliedBoundsY(val: boolean) {
    this.appliedBounds.y = val
  }

  @Input('ardAppliedBounds.width')
  public set appliedBoundsWidth(val: boolean) {
    this.appliedBounds.width = val
  }

  @Input('ardAppliedBounds.height')
  public set appliedBoundsHeight(val: boolean) {
    this.appliedBounds.height = val
  }

  @Output('ardResizeDrag')
  public resizeDrag = new EventEmitter<Rectangle>()

  @Output('ardResizeDragBegin')
  public resizeDragBegin = new EventEmitter<Rectangle>()

  @Output('ardResizeDragEnd')
  public resizeDragEnd = new EventEmitter<Rectangle>()

  constructor(private readonly elementRef: ElementRef<HTMLElement>) { }

  public ngOnInit(): void {
    if (this.disabled) {
      return
    }
    if (this.rootElementSelector) {
      this.element = getClosestMatchingAncestor(
        this.elementRef.nativeElement,
        this.rootElementSelector
      )
    }
    this.element = this.element || this.elementRef.nativeElement
    this.element.addEventListener('mousedown', this.onMousedown, true)
    this.element.addEventListener('mouseup', this.onMouseup, true)
    this.element.addEventListener('mousemove', this.onMousemove, true)

    this.resizeAnchorContainer = document.createElement('div')
    this.resizeAnchorContainer.classList.add('interactable')
    this.resizeAnchorContainer.style['display'] = 'inline-grid'
    this.resizeAnchorContainer.style['position'] = 'absolute'
    this.resizeAnchorContainer.style['top'] = '0px'
    this.resizeAnchorContainer.style['left'] = '0px'
    this.resizeAnchorContainer.style['grid-auto-flow'] = 'row'
    const templateColRows = `auto ${this.resizeWidth}px`
    this.resizeAnchorContainer.style['grid-template-columns'] = templateColRows
    this.resizeAnchorContainer.style['grid-template-rows'] = templateColRows

    this.resizeAnchorContainer.appendChild(document.createElement('div'))

    const resizeWidthHeight = `${(this.resizeWidth * 2)}px`
    const resizeBGColor = 'rgb(0, 0, 0, 0.01)'

    const topRightResizeAnchor = document.createElement('div')
    topRightResizeAnchor.style['width'] = resizeWidthHeight
    topRightResizeAnchor.style['cursor'] = 'e-resize'
    topRightResizeAnchor.style['background-color'] = resizeBGColor
    this.resizeAnchorContainer.appendChild(topRightResizeAnchor)

    const bottomLeftResizeAnchor = document.createElement('div')
    bottomLeftResizeAnchor.style['height'] = resizeWidthHeight
    bottomLeftResizeAnchor.style['cursor'] = 's-resize'
    bottomLeftResizeAnchor.style['background-color'] = resizeBGColor
    this.resizeAnchorContainer.appendChild(bottomLeftResizeAnchor)

    const bottomRightResizeAnchor = document.createElement('div')
    bottomRightResizeAnchor.style['transform'] = 'rotateZ(45deg)'
    bottomRightResizeAnchor.style['border-style'] = 'solid'
    bottomRightResizeAnchor.style['border-width'] = `${this.resizeWidth}px`
    bottomRightResizeAnchor.style['border-color'] = 'transparent transparent transparent yellow'
    bottomRightResizeAnchor.style['cursor'] = 'nwse-resize'
    this.resizeAnchorContainer.appendChild(bottomRightResizeAnchor)

    this.element.append(this.resizeAnchorContainer)

    this.applyBounds()

    /*
<div style="
    display: inline-grid;
    width: 100%;
    height: 624px;
    position: absolute;
    top: 0px;
    left: 0px;
    grid-auto-flow: column;
    grid - template - columns: auto 8px;
    grid - template - rows: auto 8px;
    "><div style="
    width: 100 %;
    "></div><div class="interactable" style="
    height: 16px;
    cursor: s - resize;
    "></div><div style="
    width: 16px;
    cursor: e - resize;
    " class="interactable"></div><div _ngcontent-jwq-c253="" class="grid - resize - corner interactable"></div></div>

    left: 100%;
    top: 100%;
    width: 0px;
    height: 0px;
    transform: translate3d(-50%, -50%, 0) rotateZ(45deg);
    border-style: solid;
    border-width: 8px;
    border-color: transparent transparent transparent yellow;
    cursor: nwse-resize;

     * */
  }

  public ngOnDestroy(): void {
    this.element.removeEventListener('mousedown', this.onMousedown)
    this.element.removeEventListener('mouseup', this.onMouseup)
    this.element.removeEventListener('mousemove', this.onMousemove)

    this.resizeAnchorContainer.remove()
  }

  private applyBounds() {
    if (this.appliedBounds.x) this.element.style['left'] = `${this.bounds.x}px`
    if (this.appliedBounds.y) this.element.style['top'] = `${this.bounds.y}px`

    const width = `${this.bounds.width}px`
    if (this.appliedBounds.width) this.element.style['width'] = width
    this.resizeAnchorContainer.style['width'] = width

    const height = `${this.bounds.height}px`
    if (this.appliedBounds.height) this.element.style['height'] = height
    this.resizeAnchorContainer.style['height'] = height
  }

  private onMousedown = (event: MouseEvent) => {
    if (this.status !== Status.OFF) {
      return
    }
    this.mouseDownPosition = {
      x: event.clientX,
      y: event.clientY,
    }
    this.mouseDownBounds = { ...this.bounds }
    const elementBounds = this.element.getBoundingClientRect()
    const offsetReverse = {
      x: elementBounds.right - event.clientX,
      y: elementBounds.bottom - event.clientY,
    }
    if (offsetReverse.x < this.resizeWidth || offsetReverse.y < this.resizeWidth) {
      this.status = Status.RESIZE
    } else {
      this.status = Status.MOVE
    }

    this.resizeDragBegin.emit(this.bounds)
  }

  private onMouseup = () => {
    if (this.status === Status.OFF) {
      return
    }

    this.status = Status.OFF

    this.resizeDragEnd.emit(this.bounds)
  }

  private onMousemove = (event: MouseEvent) => {
    if (this.status === Status.OFF) {
      return
    }

    event.preventDefault()
    event.stopImmediatePropagation()

    const delta = {
      x: event.clientX - this.mouseDownPosition.x,
      y: event.clientY - this.mouseDownPosition.y,
    }

    switch (this.status) {
      case Status.MOVE:
      case Status.RESIZE:
        if (Math.abs(delta.x) + Math.abs(delta.y) >= this.resizeDragThreshold) {
          this.status++
        } else {
          return
        }
        break
    }

    switch (this.status) {
      case Status.MOVING:
        this.bounds.x = this.mouseDownBounds.x + delta.x
        this.bounds.y = this.mouseDownBounds.y + delta.y
        break
      case Status.RESIZING:
        this.bounds.width = this.mouseDownBounds.width + delta.x
        this.bounds.height = this.mouseDownBounds.height + delta.y
        break
    }

    console.log(`S: ${this.status}`)
    console.log(`B height: ${this.bounds.height}`)
    console.log(`MDB height: ${this.mouseDownBounds.height}`)
    console.log(`deltaY: ${delta.y}`)

    this.applyBounds()
    this.resizeDrag.emit(this.bounds)
  }
}

/** Gets the closest ancestor of an element that matches a selector. */
function getClosestMatchingAncestor(element: HTMLElement, selector: string): HTMLElement {
  let currentElement = element.parentElement as HTMLElement | null

  while (currentElement) {
    // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
    if (
      currentElement.matches
        ? currentElement.matches(selector)
        : (currentElement as any).msMatchesSelector(selector)
    ) {
      return currentElement
    }

    currentElement = currentElement.parentElement
  }

  return null
}
