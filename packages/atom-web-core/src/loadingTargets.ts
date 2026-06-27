/**
 * Base loading targets shared across all atom-web projects.
 * Consuming projects should extend this with domain-specific values starting at 100+.
 *
 * @example
 * // In consuming project:
 * enum LoadingTargets {
 *     WholePage = BaseLoadingTargets.WholePage,
 *     ActiveView = BaseLoadingTargets.ActiveView,
 *     MyFeature = 100,
 * }
 */
enum BaseLoadingTargets {
    WholePage = 0,
    ActiveView = 1,
}

export { BaseLoadingTargets };

/**
 * A numeric type alias representing any loading target (base or extended).
 */
export type LoadingTarget = number;

/**
 * An optional value that qualifies a loading target, allowing the same target to be
 * tracked independently per record (e.g. one expandable row among many).
 */
export type LoadingParam = string | number;

/** A loading target qualified by a param, so the same target is tracked independently per param. */
export interface ParametrizedLoadingTarget {
    target: LoadingTarget;
    param: LoadingParam;
}

/**
 * Payload loader actions, such as show/hide. A bare target when unparametrized (keeping the
 * original numeric contract), or a {@link ParametrizedLoadingTarget} when a param is supplied.
 */
export type LoadingTargetPayload = LoadingTarget | ParametrizedLoadingTarget;
