import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Lets any "Discuss this" link pre-select the area of interest in the contact form.
 * `nonce` increments on every selection so choosing the same topic twice still re-triggers.
 */
type TopicState = {
  topic: string | null;
  nonce: number;
  selectTopic: (topic: string) => void;
};

const TopicContext = createContext<TopicState>({
  topic: null,
  nonce: 0,
  selectTopic: () => {},
});

export const useTopic = () => useContext(TopicContext);

export function TopicProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ topic: string | null; nonce: number }>({
    topic: null,
    nonce: 0,
  });

  const selectTopic = useCallback((topic: string) => {
    setState((s) => ({ topic, nonce: s.nonce + 1 }));
  }, []);

  const value = useMemo(() => ({ ...state, selectTopic }), [state, selectTopic]);
  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>;
}
