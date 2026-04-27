import { createAction, ActionCreatorWithPreparedPayload } from "@reduxjs/toolkit";

export type ActionResolveFunc<TResult> = (value?: TResult) => void;
export type ActionRejectFunc = (reason?: string) => void;

export interface ActionMeta<TResult> {
    resolve?: ActionResolveFunc<TResult>;
    reject?: ActionRejectFunc;
}

/**
 * Creates an action which accepts a payload and optional resolve/reject callbacks as meta.
 *
 * @example
 * const myAction = createActionWithMeta<MyPayload>("my/action");
 */
export function createActionWithMeta<TPayload = void, TResult = void>(type: string): ActionCreatorWithPreparedPayload<
    [TPayload, ActionResolveFunc<TResult>?, ActionRejectFunc?],
    TPayload,
    string,
    never,
    ActionMeta<TResult>
> {
    return createAction(
        type,
        (payload: TPayload, resolve: ActionResolveFunc<TResult> = () => void 0, reject: ActionRejectFunc = () => void 0) => ({
            payload,
            meta: { resolve, reject },
        })
    );
}
