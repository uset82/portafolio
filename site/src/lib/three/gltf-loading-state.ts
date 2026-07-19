import { LoadingManager } from "three";

export type GltfLoadingSnapshot =
  | { status: "idle"; loaded: 0; total: 0; url: null }
  | { status: "loading"; loaded: number; total: number; url: string }
  | { status: "ready"; loaded: number; total: number; url: null }
  | { status: "error"; loaded: number; total: number; url: string };

type LoadingListener = (snapshot: GltfLoadingSnapshot) => void;

export function createGltfProgressController() {
  let snapshot: GltfLoadingSnapshot = { status: "idle", loaded: 0, total: 0, url: null };
  const listeners = new Set<LoadingListener>();
  const manager = new LoadingManager();

  const publish = (nextSnapshot: GltfLoadingSnapshot) => {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener(snapshot));
  };

  const fail = (url: string) => {
    if (snapshot.status === "error") {
      return;
    }

    publish({
      status: "error",
      loaded: snapshot.loaded,
      total: snapshot.total,
      url,
    });
  };

  manager.onStart = (url, loaded, total) => {
    if (snapshot.status !== "error") {
      publish({ status: "loading", loaded, total, url });
    }
  };

  manager.onProgress = (url, loaded, total) => {
    if (snapshot.status !== "error") {
      publish({ status: "loading", loaded, total, url });
    }
  };

  manager.onLoad = () => {
    if (snapshot.status !== "error") {
      publish({
        status: "ready",
        loaded: snapshot.loaded,
        total: snapshot.total,
        url: null,
      });
    }
  };

  manager.onError = fail;

  return {
    manager,
    fail,
    getSnapshot: () => snapshot,
    subscribe(listener: LoadingListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
