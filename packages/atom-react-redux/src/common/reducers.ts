import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actions";
import CommonState from "./state";

const initialState: CommonState = {
    loadingTargets: {},
};

const commonReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.showLoader, (state, action) => {
            state.loadingTargets[action.payload] = (state.loadingTargets[action.payload] ?? 0) + 1;
        })
        .addCase(actions.hideLoader, (state, action) => {
            state.loadingTargets[action.payload] = (state.loadingTargets[action.payload] ?? 1) - 1;
            if ((state.loadingTargets[action.payload] ?? 0) <= 0) {
                delete state.loadingTargets[action.payload];
            }
        })
        .addCase(actions.hideAllLoaders, (state, _action) => {
            state.loadingTargets = {};
        });
});

export default commonReducer;
