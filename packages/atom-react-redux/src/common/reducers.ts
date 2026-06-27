import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actions";
import { loadingKeyFromPayload } from "./loadingKey";
import CommonState from "./state";

const initialState: CommonState = {
    loadingTargets: {},
};

const commonReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.showLoader, (state, action) => {
            const key = loadingKeyFromPayload(action.payload);
            state.loadingTargets[key] = (state.loadingTargets[key] ?? 0) + 1;
        })
        .addCase(actions.hideLoader, (state, action) => {
            const key = loadingKeyFromPayload(action.payload);
            state.loadingTargets[key] = (state.loadingTargets[key] ?? 1) - 1;
            if ((state.loadingTargets[key] ?? 0) <= 0) {
                delete state.loadingTargets[key];
            }
        })
        .addCase(actions.hideAllLoaders, (state, _action) => {
            state.loadingTargets = {};
        });
});

export default commonReducer;
