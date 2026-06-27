import type { LoadingParam, LoadingTarget, LoadingTargetPayload } from "@hwndmaster/atom-web-core";

/**
 * Builds the state key used to track a loading target in the common slice.
 * When no param is supplied the key is the bare target, preserving the unparametrized behaviour.
 * When a param is supplied the target is tracked independently per param value
 * (e.g. one expandable row among many sharing the same target).
 */
export function buildLoadingKey(target: LoadingTarget, param?: LoadingParam): string {
    return param == null ? `${target}` : `${target}:${param}`;
}

/** Resolves the state key from a show/hide loader action payload (bare target or parametrized). */
export function loadingKeyFromPayload(payload: LoadingTargetPayload): string {
    return typeof payload === "object"
        ? buildLoadingKey(payload.target, payload.param)
        : buildLoadingKey(payload);
}
