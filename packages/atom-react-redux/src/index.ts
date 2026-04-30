// Store factory
export { createAppStore, SagaHandlingType } from "./createAppStore";
export type { CreateAppStoreOptions, AppStoreSetup, AppStoreType, SagaWatcher } from "./createAppStore";

// Notification service injection (wire up toastService from atom-react-prime)
export { setNotificationService, getNotificationService } from "./notifications";
export type { NotificationService } from "./notifications";

// Action extensions
export { createActionWithMeta } from "./actionExtensions";
export type { ActionMeta, ActionResolveFunc, ActionRejectFunc } from "./actionExtensions";

// Saga utilities
export { withLoading, withCallback } from "./utils";

// callApi saga builder
export { callApi } from "./callApi";
export { ApiCallResult } from "./callApi";

// Common slice (for use in FakeStore integration)
export * as Common from "./common";
export type { default as CommonState } from "./common/state";

// Types
export type { SagaGenerator, SagaGeneratorReturns } from "./types";

// Components
export { LoadingSpinner } from "./components/loadingSpinner";
