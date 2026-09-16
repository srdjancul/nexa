/**
 * Lets a snap section consume wheel gestures for internal steps (e.g. the
 * process card carousel) before the SnapScroller moves the page on.
 */
export type StepConsumer = {
  /** Would this section consume a gesture in this direction right now? */
  will: (dir: 1 | -1) => boolean;
  /** Consume it: advance one internal step. */
  step: (dir: 1 | -1) => void;
};

const registry = new Map<Element, StepConsumer>();

export function registerStepConsumer(el: Element, consumer: StepConsumer) {
  registry.set(el, consumer);
  return () => {
    registry.delete(el);
  };
}

export function stepConsumerFor(el: Element | undefined) {
  return el ? registry.get(el) : undefined;
}
