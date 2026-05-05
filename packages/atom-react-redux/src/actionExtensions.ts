import { createAction, ActionCreatorWithPreparedPayload } from "@reduxjs/toolkit";

export type ActionResolveFunc<TResult> = (value?: TResult) => void;
export type ActionRejectFunc = (reason?: string) => void;
export type ActionValidationErrors<TFormData extends Record<string, unknown>> = Partial<Record<Extract<keyof TFormData, string>, string[]>>;
export type ActionValidationRejectFunc<TFormData extends Record<string, unknown>> = (errors: ActionValidationErrors<TFormData>) => void;

export interface ActionMeta<TResult> {
    resolve?: ActionResolveFunc<TResult>;
    reject?: ActionRejectFunc;
}

export interface ActionMetaValidatable<TResult, TFormData extends Record<string, unknown>> extends ActionMeta<TResult> {
    validationReject?: ActionValidationRejectFunc<TFormData>;
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
        (
            payload: TPayload,
            resolve: ActionResolveFunc<TResult> = () => void 0,
            reject: ActionRejectFunc = () => void 0
        ) => ({
            payload,
            meta: { resolve, reject },
        })
    );
}

/**
 * Creates an action which accepts a payload, optional validation callback, and optional resolve/reject callbacks as meta.
 */
export function createActionWithMetaValidatable<
    TPayload = void,
    TResult = void,
    TFormData extends Record<string, unknown> = Record<string, unknown>
>(type: string): ActionCreatorWithPreparedPayload<
    [TPayload, ActionValidationRejectFunc<TFormData>?, ActionResolveFunc<TResult>?, ActionRejectFunc?],
    TPayload,
    string,
    never,
    ActionMetaValidatable<TResult, TFormData>
> {
    return createAction(
        type,
        (
            payload: TPayload,
            validationReject: ActionValidationRejectFunc<TFormData> = () => void 0,
            resolve: ActionResolveFunc<TResult> = () => void 0,
            reject: ActionRejectFunc = () => void 0,
        ) => ({
            payload,
            meta: { validationReject, resolve, reject },
        })
    );
}
