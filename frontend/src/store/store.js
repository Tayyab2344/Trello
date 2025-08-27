import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice";
import organizationReducer from "./organizationSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
  },
});
export default store;
