type TouchEventWithScale = TouchEvent & {
  /**
   * @default 1
   */
  scale: number; // For some reason, TouchEvent doesn't have `scale`, bit it surely exists in iOS Safari & Chrome.
};
export function touchEventHasScale(event: TouchEvent): event is TouchEventWithScale {
  return (event as TouchEventWithScale).scale !== undefined;
}
