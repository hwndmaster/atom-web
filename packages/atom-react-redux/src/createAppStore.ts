import { combineReducers, Reducer, Store, UnknownAction } from "redux";
import createSagaMiddleware, { SagaMiddleware } from "redux-saga";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
    PersistConfig,
    Persistor,
    PersistorAction,
    persistReducer,
    PersistState,
    persistStore,
} from "redux-persist";
import { takeLatest, takeEvery, ForkEffect } from "redux-saga/effects";
import { defaultLogger } from "@hwndmaster/atom-web-core";
import { isDev } from "@hwndmaster/atom-web-core";
import type { HasToastedError } from "@hwndmaster/atom-web-core";
import * as common from "./common";

type AppStoreType<TAppState> = Store<Partial<TAppState>, UnknownAction, unknown>;

/** How a saga watcher handles dispatched actions. */
enum SagaHandlingType {
    TakeLatest = 1,
    TakeEvery = 2,
}

interface SagaWatcher {
    handlingType: SagaHandlingType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: { type: string; [key: string]: any };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saga: (...args: any[]) => any;
}

interface PersistPartial {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _persist: PersistState;
}

/**
 * Wraps a saga in an error-catching fallback that dispatches common/raiseError on uncaught exceptions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* errorFallback<TFn extends (...args: any[]) => any>(sagaFunction: TFn, action: any): Generator<any, any, any> {
    try {
        yield sagaFunction(action);
    } catch (error) {
        if (error instanceof Object
            && "toasted" in error
            && (error as HasToastedError).toasted === true
        ) {
            return;
        }
        yield common.Actions.raiseError(error);
    }
}

/**
 * Creates a watcher saga that registers all provided watchers.
 */
function createWatchApplication(
    domainWatchers: SagaWatcher[],
    commonWatchers: SagaWatcher[]
): () => IterableIterator<ForkEffect<never>> {
    return function* watchApplication(): IterableIterator<ForkEffect<never>> {
        const allWatchers = [...commonWatchers, ...domainWatchers];
        for (const item of allWatchers) {
            if (item.handlingType === SagaHandlingType.TakeLatest) {
                yield takeLatest(item.action.type, errorFallback, item.saga);
            } else if (item.handlingType === SagaHandlingType.TakeEvery) {
                yield takeEvery(item.action.type, errorFallback, item.saga);
            } else {
                throw new Error("Unexpected saga handling type.");
            }
        }
    };
}

interface CreateAppStoreOptions {
    /**
     * Domain-specific reducers in addition to the built-in common reducer.
     * The 'common' key is reserved and will be ignored if provided.
     */
    domainReducers: Omit<Record<string, Reducer>, "common">;
    /** Domain-specific saga watchers to run alongside the built-in common watcher. */
    domainWatchers: SagaWatcher[];
    /** Key for redux-persist. Defaults to "root". */
    persistKey?: string;
    /** Version for redux-persist. Increment when persisted state structure changes. Defaults to 1. */
    persistVersion?: number;
    /** Keys to exclude from persistence (they won't be stored in localStorage). */
    persistBlacklist?: string[];
}

interface AppStoreSetup<TAppState> {
    /** Sets up a new store instance with optional preloaded state. */
    setupStore: (preloadedState?: Partial<TAppState>, isTestEnvironment?: boolean) => {
        store: AppStoreType<TAppState>;
        sagaMiddleware: SagaMiddleware;
        persistor: Persistor;
    };
    /** Returns the current singleton store, initializing it if needed. */
    getStore: () => AppStoreType<TAppState>;
    /** Sets the store singleton. For testing only. */
    setStore: (store: AppStoreType<TAppState>, persistor: Persistor) => void;
    /** Returns the current persistor. */
    getPersistor: () => Persistor;
    /** Dispatch hook typed to the app's dispatch type. */
    useAppDispatch: () => AppStoreType<TAppState>["dispatch"];
    /** Selector hook typed to the app state. */
    useAppSelector: TypedUseSelectorHook<TAppState>;
    /** The watcher saga (for use in FakeStore tests). */
    watchApplication: () => IterableIterator<ForkEffect<never>>;
    /** All saga watchers (for use in FakeStore tests). */
    applicationWatchers: SagaWatcher[];
}

/**
 * Creates a configured Redux store factory for a consuming project.
 * Call this once at the module level (e.g. store/setup.ts) to get the store utilities.
 *
 * @example
 * const {
 *   setupStore, getStore, setStore, getPersistor,
 *   useAppDispatch, useAppSelector, watchApplication,
 * } = createAppStore<AppState>({
 *   domainReducers: { categories: categoriesReducer, products: productsReducer },
 *   domainWatchers: categoriesWatchers,
 *   persistKey: "root",
 *   persistVersion: 2,
 *   persistBlacklist: ["common"],
 * });
 */
function createAppStore<TAppState extends { common: unknown }>(
    options: CreateAppStoreOptions
): AppStoreSetup<TAppState> {
    const {
        domainReducers,
        domainWatchers,
        persistKey = "root",
        persistVersion = 1,
        persistBlacklist = ["common"],
    } = options;

    // Custom localStorage adapter — avoids CJS/ESM interop issues with redux-persist's built-in storage in Vite 8+
    const storage = {
        async getItem(key: string): Promise<string | null> {
            return localStorage.getItem(key);
        },
        async setItem(key: string, value: string): Promise<void> {
            localStorage.setItem(key, value);
        },
        async removeItem(key: string): Promise<void> {
            localStorage.removeItem(key);
        },
    };

    const appReducers = {
        common: common.Reducers,
        ...domainReducers,
    };

    const commonWatchers: SagaWatcher[] = [
        { handlingType: SagaHandlingType.TakeEvery, action: common.Actions.raiseError, saga: common.Sagas.raiseErrorSaga },
    ];

    const allWatchers: SagaWatcher[] = [...commonWatchers, ...domainWatchers];
    const watchApplication = createWatchApplication(domainWatchers, commonWatchers);

    let storeInstance: AppStoreType<TAppState>;
    let persistorInstance: Persistor;

    function setupStore(
        preloadedState?: Partial<TAppState>,
        isTestEnvironment: boolean | undefined = false
    ): {
        store: AppStoreType<TAppState>;
        sagaMiddleware: SagaMiddleware;
        persistor: Persistor;
    } {
        const sagaMiddleware = createSagaMiddleware({
            onError(error, errorInfo) {
                defaultLogger.error("An error occurred in the Saga middleware:", error, errorInfo);
            },
        });

        const rootReducer = combineReducers(appReducers as Record<string, Reducer>);

        const persistConfig: PersistConfig<TAppState> = {
            key: persistKey,
            storage,
            version: persistVersion,
            blacklist: persistBlacklist,
            whitelist: isTestEnvironment ? ["__non_existent__"] : undefined,
            migrate: async (state: PersistPartial | undefined, currentVersion: number) => {
                if (state != undefined && state._persist.version !== currentVersion) {
                    const initialState = rootReducer(undefined, { type: "@@INIT" });
                    return Promise.resolve(initialState as unknown as TAppState & PersistPartial);
                }
                return Promise.resolve(state as TAppState & PersistPartial);
            },
        };

        const reducers = (isTestEnvironment
            ? combineReducers({
                ...appReducers,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _persist: (): PersistState => ({ version: 0, rehydrated: true }),
            } as Record<string, Reducer>)
            : persistReducer(persistConfig, rootReducer as Reducer)) as Reducer<TAppState & PersistPartial>;

        const store = configureStore({
            reducer: reducers,
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false,
                }).concat(sagaMiddleware),
            preloadedState: { ...preloadedState } as TAppState & PersistPartial,
            devTools: isDev,
        });

        const persistor = isTestEnvironment ? createEmptyPersistor() : persistStore(store);

        return { store: store as AppStoreType<TAppState>, sagaMiddleware, persistor };
    }

    function getStore(): AppStoreType<TAppState> {
        if (storeInstance === undefined) {
            const { store, sagaMiddleware, persistor } = setupStore({});
            storeInstance = store;
            persistorInstance = persistor;
            const task = sagaMiddleware.run(watchApplication);
            task.toPromise().catch((error: unknown) => {
                const msg = "The application runner stopped working. Please restart the application.";
                defaultLogger.error(`${msg} Details: %o`, error);
            });
        }
        return storeInstance;
    }

    function setStore(store: AppStoreType<TAppState>, persistor: Persistor): void {
        storeInstance = store;
        persistorInstance = persistor;
    }

    function getPersistor(): Persistor {
        getStore();
        return persistorInstance;
    }

    const useAppDispatch = useDispatch.withTypes<AppStoreType<TAppState>["dispatch"]>();
    const useAppSelector: TypedUseSelectorHook<TAppState> = useSelector;

    return {
        setupStore,
        getStore,
        setStore,
        getPersistor,
        useAppDispatch,
        useAppSelector,
        watchApplication,
        applicationWatchers: allWatchers,
    };
}

function createEmptyPersistor(): Persistor {
    return {
        pause: () => { },
        persist: () => { },
        purge: async () => Promise.resolve(),
        flush: async () => Promise.resolve(),
        dispatch: (persistorAction: PersistorAction) => persistorAction,
        getState: () => ({ registry: [], bootstrapped: true }),
        subscribe: () => () => { },
    } as Persistor;
}

export type { AppStoreType, CreateAppStoreOptions, AppStoreSetup, SagaWatcher };
export { createAppStore, SagaHandlingType };
