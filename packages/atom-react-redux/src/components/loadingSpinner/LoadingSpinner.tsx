import { FC, ReactNode, memo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import type { LoadingParam, LoadingTarget } from "@hwndmaster/atom-web-core";
import { CircularProgress } from "@hwndmaster/atom-react-core";
import { buildLoadingKey } from "@/common/loadingKey";
import type CommonState from "@/common/state";
import "./loadingSpinner.module.scss";

interface StateWithCommon {
    common: CommonState;
}

interface LoadingSpinnerProps {
    target: LoadingTarget;
    /**
     * Optional value qualifying the target. When set, the spinner only activates if a
     * withLoading call blocked the same target with the same param — letting multiple
     * spinners on one page share a target yet load independently per record.
     */
    param?: LoadingParam;
    children: ReactNode;
}

const LoadingSpinnerComponent: FC<LoadingSpinnerProps> = (props) => {
    const key = buildLoadingKey(props.target, props.param);
    const isActive = useSelector<StateWithCommon, boolean>(
        (state) => (state.common.loadingTargets[key] ?? 0) > 0,
        shallowEqual
    );

    const testId = props.param == null
        ? `LoadingSpinner__${props.target}`
        : `LoadingSpinner__${props.target}__${props.param}`;

    return (
        <div
            className="loadingSpinnerContainer"
            data-testid={testId}
            data-loading={isActive}
        >
            <div className="loadingSpinner">
                <CircularProgress />
            </div>
            <div className="loadingSpinnerContent">{props.children}</div>
        </div>
    );
};

const LoadingSpinner = memo(LoadingSpinnerComponent);

export default LoadingSpinner;
