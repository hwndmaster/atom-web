import * as vitest from "vitest";
import { takeLatest, takeEvery, ForkEffect } from "redux-saga/effects";
import type { Action, UnknownAction } from "@reduxjs/toolkit";
import type { Store } from "@reduxjs/toolkit";
import type { SagaMiddleware } from "redux-saga";
import type { Persistor } from "redux-persist";
import { SagaHandlingType, type SagaWatcher } from "@hwndmaster/atom-react-redux";

type ActionSaga<TAction extends Action = UnknownAction> = (action: TAction) => void;

interface TypedActionCreator<TType extends string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]): Action<TType>;
    type: TType;
}

interface FakeStoreSetupResult<TAppState> {
    store: Store<TAppState>;
    sagaMiddleware: SagaMiddleware;
    persistor: Persistor;
}

interface FakeStoreOptions<TAppState> {
    /** The project's setupStore function (e.g. from createAppStore). */
    setupStore: (preloadedState?: Partial<TAppState>, isTestEnvironment?: boolean) => FakeStoreSetupResult<TAppState>;
    /** The project's setStore function (e.g. from createAppStore). */
    setStore: (store: Store<TAppState>, persistor: Persistor) => void;
    /** All application saga watchers (from applicationWatchers returned by createAppStore). */
    applicationWatchers: SagaWatcher[];
}

/**
 * Creates a FakeStore instance for testing.
 * Use this once per test file to get a pre-configured store that intercepts sagas.
 *
 * @example
 * // In your project's test utilities:
 * import { createFakeStore } from "@hwndmaster/atom-testing-utils";
 * import { setupStore, setStore, applicationWatchers } from "@/store";
 * import type AppState from "@/store/appState";
 *
 * const fakeStore = createFakeStore<AppState>({ setupStore, setStore, applicationWatchers });
 * export default fakeStore;
 */
function createFakeStore<TAppState>(options: FakeStoreOptions<TAppState>): FakeStoreInstance<TAppState> {
    return new FakeStoreInstance(options);
}

class FakeStoreInstance<TAppState> {
    private underlyingStore?: Store<TAppState>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly actionSagas: Map<string, ActionSaga<any>> = new Map();

    constructor(private readonly opts: FakeStoreOptions<TAppState>) {
    }

    public setup(preloadedState?: Partial<TAppState>): void {
        this.setupInternal(true, preloadedState);
    }

    private setupInternal(throwIfAlreadySetUp: boolean, preloadedState?: Partial<TAppState>): void {
        if (this.underlyingStore != undefined) {
            if (throwIfAlreadySetUp) {
                vitest.expect.fail("The store is already set up.");
            }
            return;
        }

        const storeTuple = this.opts.setupStore(preloadedState, true);
        this.underlyingStore = storeTuple.store;
        this.opts.setStore(storeTuple.store, storeTuple.persistor);
        storeTuple.sagaMiddleware.run(this.watchProject.bind(this));
    }

    public reset(): void {
        this.underlyingStore = undefined;
        this.actionSagas.clear();
    }

    public setupAction<TActionCreator extends TypedActionCreator<string>>(
        actionCreator: TActionCreator,
        saga: ActionSaga<ReturnType<TActionCreator>>
    ): void {
        this.setupInternal(false);
        this.actionSagas.set(actionCreator.type, saga);
    }

    protected sagaHandler(action: Action<string>): void {
        const saga = this.actionSagas.get(action.type);
        if (saga != undefined) {
            saga(action);
        } else {
            vitest.expect.fail(`No saga handler found for action type: ${action.type}`);
        }
    }

    private *watchProject(): IterableIterator<ForkEffect<never>> {
        for (const item of this.opts.applicationWatchers) {
            if (item.handlingType === SagaHandlingType.TakeLatest) {
                yield takeLatest(item.action.type, this.sagaHandler.bind(this));
            } else if (item.handlingType === SagaHandlingType.TakeEvery) {
                yield takeEvery(item.action.type, this.sagaHandler.bind(this));
            } else {
                throw new Error("Unexpected saga handling type.");
            }
        }
    }

    public get store(): Store<TAppState> {
        this.setupInternal(false);
        return this.underlyingStore!;
    }
}

export { createFakeStore };
