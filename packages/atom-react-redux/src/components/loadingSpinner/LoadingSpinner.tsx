import { FC, ReactNode, memo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import type { LoadingTarget } from "@hwndmaster/atom-web-core";
import { CircularProgress } from "@hwndmaster/atom-react-core";
import type CommonState from "@/common/state";
import "./loadingSpinner.module.scss";

interface StateWithCommon {
    common: CommonState;
}

interface LoadingSpinnerProps {
    target: LoadingTarget;
    children: ReactNode;
}

const LoadingSpinnerComponent: FC<LoadingSpinnerProps> = (props) => {
    const isActive = useSelector<StateWithCommon, boolean>(
        (state) => (state.common.loadingTargets[props.target as number] ?? 0) > 0,
        shallowEqual
    );

    return (
        <div
            className="loadingSpinnerContainer"
            data-testid={`LoadingSpinner__${props.target}`}
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
