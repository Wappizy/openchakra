import { RootState } from '../store'

export const getShowLayout = (state: RootState) => state.app.showLayout

export const getShowCode = (state: RootState) => state.app.showCode

export const getFocusedComponent = (state: RootState) =>
  state.app.useComponentFocused

export const getShowInputText = (state: RootState) => state.app.focusInputText
