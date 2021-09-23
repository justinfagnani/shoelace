import { css } from 'lit';
import componentStyles from '../../styles/component.styles';
import { focusVisibleSelector } from '../../internal/focus-visible';

export default css`
  ${componentStyles}

  :host {
    --height: var(--sl-toggle-size);
    --thumb-size: calc(var(--sl-toggle-size) + 4px);
    --width: calc(var(--height) * 2);

    display: inline-block;
  }

  .switch {
    display: inline-flex;
    align-items: center;
    font-family: var(--sl-input-font-family);
    font-size: var(--sl-input-font-size-medium);
    font-weight: var(--sl-input-font-weight);
    color: rgb(var(--sl-input-color));
    vertical-align: middle;
    cursor: pointer;
  }

  .switch__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--width);
    height: var(--height);
    background-color: rgb(var(--sl-color-neutral-400));
    border: solid var(--sl-input-border-width) rgb(var(--sl-color-neutral-400));
    border-radius: var(--height);
    transition: var(--sl-transition-fast) border-color, var(--sl-transition-fast) background-color;
  }

  .switch__control .switch__thumb {
    width: var(--thumb-size);
    height: var(--thumb-size);
    background-color: rgb(var(--sl-surface-base));
    border-radius: 50%;
    border: solid var(--sl-input-border-width) rgb(var(--sl-color-neutral-400));
    transform: translateX(calc((var(--width) - var(--height)) / -2));
    transition: var(--sl-transition-fast) transform ease, var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) border-color, var(--sl-transition-fast) box-shadow;
  }

  .switch__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  /* Hover */
  .switch:not(.switch--checked):not(.switch--disabled) .switch__control:hover {
    background-color: rgb(var(--sl-color-neutral-400));
    border-color: rgb(var(--sl-color-neutral-400));
  }

  .switch:not(.switch--checked):not(.switch--disabled) .switch__control:hover .switch__thumb {
    background-color: rgb(var(--sl-surface-base));
    border-color: rgb(var(--sl-color-neutral-400));
  }

  /* Focus */
  .switch:not(.switch--checked):not(.switch--disabled) .switch__input${focusVisibleSelector} ~ .switch__control {
    background-color: rgb(var(--sl-color-neutral-400));
    border-color: rgb(var(--sl-color-neutral-400));
  }

  .switch:not(.switch--checked):not(.switch--disabled)
    .switch__input${focusVisibleSelector}
    ~ .switch__control
    .switch__thumb {
    background-color: rgb(var(--sl-color-neutral-0));
    border-color: rgb(var(--sl-color-primary-600));
    box-shadow: 0 0 0 var(--sl-focus-ring-width) rgb(var(--sl-color-primary-500) / var(--sl-focus-ring-alpha));
  }

  /* Checked */
  .switch--checked .switch__control {
    background-color: rgb(var(--sl-color-primary-600));
    border-color: rgb(var(--sl-color-primary-600));
  }

  .switch--checked .switch__control .switch__thumb {
    background-color: rgb(var(--sl-surface-base));
    border-color: rgb(var(--sl-color-primary-600));
    transform: translateX(calc((var(--width) - var(--height)) / 2));
  }

  /* Checked + hover */
  .switch.switch--checked:not(.switch--disabled) .switch__control:hover {
    background-color: rgb(var(--sl-color-primary-600));
    border-color: rgb(var(--sl-color-primary-600));
  }

  .switch.switch--checked:not(.switch--disabled) .switch__control:hover .switch__thumb {
    background-color: rgb(var(--sl-surface-base));
    border-color: rgb(var(--sl-color-primary-600));
  }

  /* Checked + focus */
  .switch.switch--checked:not(.switch--disabled) .switch__input${focusVisibleSelector} ~ .switch__control {
    background-color: rgb(var(--sl-color-primary-600));
    border-color: rgb(var(--sl-color-primary-600));
  }

  .switch.switch--checked:not(.switch--disabled)
    .switch__input${focusVisibleSelector}
    ~ .switch__control
    .switch__thumb {
    background-color: rgb(var(--sl-surface-base));
    border-color: rgb(var(--sl-color-primary-600));
    box-shadow: 0 0 0 var(--sl-focus-ring-width) rgb(var(--sl-color-primary-500) / var(--sl-focus-ring-alpha));
  }

  /* Disabled */
  .switch--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch__label {
    line-height: var(--height);
    margin-left: 0.5em;
    user-select: none;
  }
`;
