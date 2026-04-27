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

    constructor(channel?: ReturnType<typeof stdChannel<UnknownAction>>) {
        this.channel = channel;
    }

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
            throw error;
        }
    }

    public setInitialState(state: TAppState): void {
        this.initialState = state;
    }

    public reset(): void {
        this.dispatchedActions.length = 0;
        this.errorsOccurred.length = 0;
    }

    public findDispatchedAction<TPayload>(action: ActionCreatorWithPayload<TPayload, string>): TPayload | undefined {
        const found = this.dispatchedActions.find((a) => a.type === action.type);
        return found != undefined ? found.payload as TPayload : undefined;
    }

    public findDispatchedActions<TPayload>(action: ActionCreatorWithPayload<TPayload, string>): TPayload[] {
        return this.dispatchedActions
            .filter((a) => a.type === action.type)
            .map((a) => a.payload as TPayload);
    }

    public get dispatched(): Readonly<DispatchedAction[]> {
        return this.dispatchedActions;
    }

    public get errors(): Readonly<string[]> {
        return this.errorsOccurred;
    }
}

export default SagaRunner;
