"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

import {
  createObservatorySceneStore,
  type ObservatorySceneState,
  type ObservatorySceneStore,
} from "@/lib/three/scene-state";

const ObservatorySceneContext = createContext<ObservatorySceneStore | null>(null);

export type ObservatorySceneProviderProps = {
  children: ReactNode;
  initialState?: ObservatorySceneState;
  store?: ObservatorySceneStore;
};

export function ObservatorySceneProvider({
  children,
  initialState,
  store,
}: ObservatorySceneProviderProps) {
  const [localStore] = useState(() => createObservatorySceneStore(initialState));

  return (
    <ObservatorySceneContext.Provider value={store ?? localStore}>
      {children}
    </ObservatorySceneContext.Provider>
  );
}

export function useObservatorySceneStore() {
  const store = useContext(ObservatorySceneContext);
  if (!store) {
    throw new Error("Observatory scene hooks require ObservatorySceneProvider.");
  }
  return store;
}

export function useObservatorySceneSnapshot() {
  const store = useObservatorySceneStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
