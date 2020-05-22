import { Component, Element, Event, EventEmitter, Method, Prop, Watch, h } from '@stencil/core';
import { scrollIntoView } from '../../utilities/scroll';
import Popover from '../../utilities/popover';

let id = 0;

/**
 * @slot trigger - The dropdown's trigger, usually a `<sl-button>` element.
 * @slot - The dropdown's menu items.
 */

@Component({
  tag: 'sl-dropdown',
  styleUrl: 'dropdown.scss',
  shadow: true
})
export class Dropdown {
  id = `sl-dropdown-${++id}`;
  ignoreMouseEvents = false;
  ignoreMouseTimeout: any;
  ignoreOpenWatcher = false;
  menu: HTMLElement;
  popover: Popover;
  trigger: HTMLElement;

  constructor() {
    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
    this.handleDocumentMouseDown = this.handleDocumentMouseDown.bind(this);
    this.handleTriggerKeyDown = this.handleTriggerKeyDown.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuMouseOver = this.handleMenuMouseOver.bind(this);
    this.handleMenuMouseOut = this.handleMenuMouseOut.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  @Element() host: HTMLSlDropdownElement;

  /** Indicates whether or not the dropdown is open. */
  @Prop({ mutable: true, reflect: true }) open = false;

  /**
   * The preferred placement of the dropdown menu. Note that the actual placement may vary as needed to keep the menu
   * inside of the viewport.
   */
  @Prop() placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end' = 'bottom-start';

  /** The dropdown will close when the user interacts outside of this element (e.g. clicking). */
  @Prop() containingElement: HTMLElement = this.host;

  /** Emitted when the dropdown opens. Calling `event.preventDefault()` will prevent it from being opened. */
  @Event() slShow: EventEmitter;

  /** Emitted after the dropdown opens and all transitions are complete. */
  @Event() slAfterShow: EventEmitter;

  /** Emitted when the dropdown closes. Calling `event.preventDefault()` will prevent it from being closed. */
  @Event() slHide: EventEmitter;

  /** Emitted after the dropdown closes and all transitions are complete. */
  @Event() slAfterHide: EventEmitter;

  @Watch('open')
  handleOpenChange() {
    if (!this.ignoreOpenWatcher) {
      this.open ? this.show() : this.hide();
    }
  }

  @Watch('placement')
  handlePlacementChange() {
    this.popover.setOptions({ placement: this.placement });
  }

  componentDidLoad() {
    this.popover = new Popover(this.trigger, this.menu, {
      placement: 'bottom-start',
      offset: [0, 2],
      onAfterHide: () => this.slAfterHide.emit(),
      onAfterShow: () => this.slAfterShow.emit(),
      onTransitionEnd: () => {
        if (!this.open) {
          this.menu.scrollTop = 0;
        }
      }
    });

    // Show on init if open
    if (this.open) {
      this.show();
    }
  }

  componentDidUnload() {
    this.hide();
    this.popover.destroy();
  }

  /** Shows the dropdown menu */
  @Method()
  async show() {
    this.ignoreOpenWatcher = true;
    this.open = true;

    const slShow = this.slShow.emit();

    if (slShow.defaultPrevented) {
      this.open = false;
      this.ignoreOpenWatcher = false;
      return;
    }

    this.popover.show();
    this.ignoreOpenWatcher = false;

    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  /** Hides the dropdown menu */
  @Method()
  async hide() {
    this.ignoreOpenWatcher = true;
    this.open = false;

    const slHide = this.slHide.emit();

    if (slHide.defaultPrevented) {
      this.open = true;
      this.ignoreOpenWatcher = false;
      return;
    }

    this.popover.hide();
    this.ignoreOpenWatcher = false;
    this.setSelectedItem(null);

    document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  getAllItems() {
    const slot = this.menu.querySelector('slot');
    return [...slot.assignedElements()].filter(
      (el: any) => el.tagName.toLowerCase() === 'sl-dropdown-item' && !el.disabled
    ) as [HTMLSlDropdownItemElement];
  }

  getSelectedItem() {
    return this.getAllItems().find(i => i.active);
  }

  setSelectedItem(item: HTMLSlDropdownItemElement) {
    this.getAllItems().map(i => (i.active = i === item));
  }

  scrollItemIntoView(item: HTMLSlDropdownItemElement) {
    if (item) {
      scrollIntoView(item, this.menu);
    }
  }

  handleDocumentKeyDown(event: KeyboardEvent) {
    // When keying through the menu, if the mouse happens to be hovering over a menu item and the menu scrolls, the
    // mouseout/mouseover event will fire causing the selection to be different than what the user expects. This gives
    // us a way to temporarily ignore mouse events while the user is interacting with a keyboard.
    clearTimeout(this.ignoreMouseTimeout);
    this.ignoreMouseTimeout = setTimeout(() => (this.ignoreMouseEvents = false), 500);
    this.ignoreMouseEvents = true;

    // Close when escape is pressed
    if (event.key === 'Escape') {
      this.hide();
      return;
    }

    // Close when tabbing results in the focus leaving the close element
    if (event.key === 'Tab') {
      setTimeout(() => {
        if (
          document.activeElement &&
          document.activeElement.closest(this.containingElement.tagName.toLowerCase()) !== this.containingElement
        ) {
          this.hide();
          return;
        }
      });
    }

    // Make a selection when pressing enter
    if (event.key === 'Enter') {
      const item = this.getSelectedItem();
      event.preventDefault();

      if (item && !item.disabled) {
        item.click();
        this.hide();
        return;
      }
    }

    // Move the selection when pressing down or up
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const items = this.getAllItems();
      const selectedItem = this.getSelectedItem();
      let index = items.indexOf(selectedItem);

      if (items.length) {
        event.preventDefault();

        if (event.key === 'ArrowDown') {
          index++;
        } else if (event.key === 'ArrowUp') {
          index--;
        } else if (event.key === 'Home') {
          index = 0;
        } else if (event.key === 'End') {
          index = items.length - 1;
        }

        if (index < 0) index = 0;
        if (index > items.length - 1) index = items.length - 1;

        this.setSelectedItem(items[index]);
        this.scrollItemIntoView(items[index]);

        return;
      }
    }
  }

  handleDocumentMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close when clicking outside of the close element
    if (target.closest(this.containingElement.tagName.toLowerCase()) !== this.containingElement) {
      this.hide();
      return;
    }
  }

  handleTriggerKeyDown(event: KeyboardEvent) {
    // Open the menu when pressing down or up while focused on the trigger
    if (!this.open && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      this.show();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  handleMenuClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownItem = target.closest('sl-dropdown-item');

    // Close when clicking on a dropdown item
    if (dropdownItem && !dropdownItem.disabled) {
      this.hide();
      return;
    }
  }

  handleMenuMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownItem = target.closest('sl-dropdown-item');

    if (!this.ignoreMouseEvents && dropdownItem) {
      this.setSelectedItem(dropdownItem);
    }
  }

  handleMenuMouseOut() {
    if (!this.ignoreMouseEvents) {
      this.setSelectedItem(null);
    }
  }

  toggleMenu() {
    this.open ? this.hide() : this.show();
  }

  render() {
    return (
      <div
        id={this.id}
        class={{
          'sl-dropdown': true,
          'sl-dropdown--open': this.open
        }}
        aria-expanded={this.open}
        aria-haspopup="true"
      >
        <span
          class="sl-dropdown__trigger"
          ref={el => (this.trigger = el)}
          onKeyDown={this.handleTriggerKeyDown}
          onClick={this.toggleMenu}
        >
          <slot name="trigger" />
        </span>

        <div
          ref={el => (this.menu = el)}
          part="menu"
          class="sl-dropdown__menu"
          role="menu"
          aria-hidden={!this.open}
          aria-labeledby={this.id}
          onClick={this.handleMenuClick}
          onMouseOver={this.handleMenuMouseOver}
          onMouseOut={this.handleMenuMouseOut}
          hidden
        >
          <slot />
        </div>
      </div>
    );
  }
}
