import { runSaga, Saga, stdChannel } from "redux-saga";
import { ActionCreatorWithPayload, UnknownAction } from "@reduxjs/toolkit";

interface DispatchedAction {
    type: string;
    payload: unknown;
}

/**
 * Utility class to run sagas in tests and capture dispatched actions and errors.
 *
 * @example
 * const sagaRunner = new SagaRunner();
 * await sagaRunner.runSaga(fetchProductsSaga, fetchProducts());
 * expect(sagaRunner.findDispatchedAction(setProducts)?.length).toBeGreaterThan(0);
 */
class SagaRunner<TAppState = unknown> {
    private readonly dispatchedActions: DispatchedAction[] = [];
    private readonly errorsOccurred: string[] = [];
    private initialState: TAppState | undefined = undefined;
    private readonly channel: ReturnType<typeof stdChannel<UnknownAction>> | undefined;

    /**
     * Creates a new SagaRunner instance.
     * @param channel Optional channel to use for saga communication (for take/put effects).
     */
    constructor(channel?: ReturnType<typeof stdChannel<UnknownAction>>) {
        this.channel = channel;
    }

    /**
     * Runs the given saga with the provided payload.
     * @param saga The saga to run.
     * @param payload The payload to pass to the saga.
     */
    public async runSaga<TSaga extends Saga>(saga: TSaga, ...payload: Parameters<TSaga>): Promise<void> {
        try {
            await runSaga({
                channel: this.channel,
                dispatch: (action) => {
                    if (action != null
                        && typeof action === "object"
                        && "type" in action) {
                        this.dispatchedActions.push({
                            type: action.type as string,
                            payload: "payload" in action ? action.payload : undefined,
                        });
                    } else {
                        throw new Error("Invalid action dispatched.");
                    }
                },
                getState: () => this.initialState,
            }, saga, ...payload).toPromise();
        } catch (error) {
            this.errorsOccurred.push((error ?? "").toString());
        }
    }

    /**
     * Sets the initial state for the saga runner.
     * @param state The initial application state.
     */
    public setInitialState(state: Partial<TAppState>): void {
        this.initialState = state as TAppState;
    }

    /**
     * Clears all dispatched actions and errors from previous saga runs.
     * Useful when reusing the same SagaRunner instance across multiple tests.
     */
    public reset(): void {
        this.dispatchedActions.length = 0;
        this.errorsOccurred.length = 0;
    }

    /**
     * Finds a dispatched action by its action creator.
     * @param action The action creator to search for.
     * @returns The payload of the found action, or undefined if not found.
     */
    public findDispatchedAction<TPayload>(action: ActionCreatorWithPayload<TPayload, string>): TPayload | undefined {
        const found = this.dispatchedActions.find((dispatchedAction) => dispatchedAction.type === action.type);
        return found != undefined ? found.payload as TPayload : undefined;
    }

    /**
     * Finds all dispatched action by their action creator.
     * @param action The action creator to search for.
     * @returns The payloads of all the found actions, or empty array if not found any.
     */
    public findDispatchedActions<TPayload>(action: ActionCreatorWithPayload<TPayload, string>): TPayload[] {
        return this.dispatchedActions
            .filter((dispatchedAction) => dispatchedAction.type === action.type)
            .map((dispatchedAction) => dispatchedAction.payload as TPayload);
    }

    /**
     * Gets the list of dispatched actions.
     */
    public get dispatched(): Readonly<DispatchedAction[]> {
        return this.dispatchedActions;
    }

    /**
     * Gets the list of errors that occurred during saga execution.
     */
    public get errors(): Readonly<string[]> {
        return this.errorsOccurred;
    }
}

export default SagaRunner;
