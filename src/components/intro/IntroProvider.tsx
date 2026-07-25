"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { IntroSequence } from "./IntroSequence";

type IntroContextValue = {
  /** True once the overlay has finished and the page below is interactive. */
  finished: boolean;
};

const IntroContext = createContext<IntroContextValue>({ finished: false });

/**
 * Anything that should wait for the intro before animating in — the fixed
 * navigation, the hero — reads this.
 *
 * Content is never gated on it: every section is in the DOM and readable from
 * the first paint. Only the *entrance animation* waits.
 */
export function useIntroFinished(): boolean {
  return useContext(IntroContext).finished;
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [finished, setFinished] = useState(false);
  const handleComplete = useCallback(() => setFinished(true), []);
  const value = useMemo(() => ({ finished }), [finished]);

  return (
    <IntroContext.Provider value={value}>
      <IntroSequence onComplete={handleComplete} />
      {children}
    </IntroContext.Provider>
  );
}
