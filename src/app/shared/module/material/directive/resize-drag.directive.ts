import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core'
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
export class ResizeDragDirective implements OnInit, OnChanges, OnDestroy {
  private element: HTMLElement
  private resizeAnchorContainer: HTMLElement
  private dragAreaExtension: HTMLElement

  private status: Status = Status.OFF;

  private mouseDownPosition: Point
  private mouseDownBounds: Rectangle

  @Input('appResizeDrag')
  public rootElementSelector: string

  @Input('ardDisabled')
  public disabled: boolean

  @Input('ardInteractionsDisabled')
  public interactionsDisabled: boolean

  @Input('ardAllowResize')
  public allowResize: boolean

  @Input('ardExtendDragArea')
  public extendDragArea: boolean

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

    this.onChanged()
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.onChanged()
  }

  public ngOnDestroy(): void {
    this.element.removeEventListener('mousedown', this.onMousedown)
    this.element.removeEventListener('mouseup', this.onMouseup)
    this.element.removeEventListener('mousemove', this.onMousemove)

    this.resizeAnchorContainer?.remove()
  }

  private onChanged() {
    if (!this.element) {
      return
    }

    if (this.allowResize && !this.resizeAnchorContainer) {
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
    }

    if (this.extendDragArea && !this.dragAreaExtension) {
      this.dragAreaExtension = document.createElement('div')
      this.dragAreaExtension.style['display'] = 'none'
      this.dragAreaExtension.style['position'] = 'fixed'
      this.dragAreaExtension.style['left'] = '0px'
      this.dragAreaExtension.style['top'] = '0px'
      this.dragAreaExtension.style['width'] = '500px'
      this.dragAreaExtension.style['height'] = '500px'
      this.dragAreaExtension.style['transform'] = 'translate3d(-50%, -50%, 0)'
      this.dragAreaExtension.classList.add('interactable')

      this.element.append(this.dragAreaExtension)
    }

    this.applyBounds()
  }

  private applyBounds() {
    if (this.disabled) {
      return
    }

    if (this.appliedBounds.x) this.element.style['left'] = `${this.bounds.x}px`

    if (this.appliedBounds.y) this.element.style['top'] = `${this.bounds.y}px`

    const width = `${this.bounds.width}px`
    if (this.appliedBounds.width) this.element.style['width'] = width
    if (this.resizeAnchorContainer) this.resizeAnchorContainer.style['width'] = width

    const height = `${this.bounds.height}px`
    if (this.appliedBounds.height) this.element.style['height'] = height
    if (this.resizeAnchorContainer) this.resizeAnchorContainer.style['height'] = height
  }

  private onMousedown = (event: MouseEvent) => {
    if (this.disabled || this.interactionsDisabled || this.status !== Status.OFF) {
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
    if (this.disabled || this.interactionsDisabled || this.status === Status.OFF) {
      return
    }

    const oldStatus = this.status
    this.status = Status.OFF

    if (this.dragAreaExtension) this.dragAreaExtension.style['display'] = 'none'

    switch (oldStatus) {
      case Status.MOVING:
      case Status.RESIZING:
        this.resizeDragEnd.emit(this.bounds)
    }
  }

  private onMousemove = (event: MouseEvent) => {
    if (this.disabled || this.interactionsDisabled || this.status === Status.OFF) {
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
          if (this.dragAreaExtension) this.dragAreaExtension.style['display'] = 'block'
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

    if (this.dragAreaExtension) {
      this.dragAreaExtension.style['left'] = `${event.clientX}px`
      this.dragAreaExtension.style['top'] = `${event.clientY}px`
    }

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
