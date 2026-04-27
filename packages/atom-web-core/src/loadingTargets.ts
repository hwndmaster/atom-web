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
