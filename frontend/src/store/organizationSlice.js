import { createSlice } from "@reduxjs/toolkit";

const organizationSlice = createSlice({
  name: "organization",
  initialState: {
    activeOrgId: null,
    organizations: [],
  },
  reducers: {
    setActiveorgid: (state, action) => {
      state.activeOrgId = action.payload;
    },
    clearActiveorgid: (state) => {
      state.activeOrgId = null;
    },
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
    },
  },
});

export const { setActiveorgid, clearActiveorgid, setOrganizations } =
  organizationSlice.actions;
export default organizationSlice.reducer;
