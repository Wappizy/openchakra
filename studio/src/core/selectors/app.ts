import { RootState } from '~core/store'

const getPageLayout = (state: RootState) => state.app.pageLayout
const getShowOverview = (state: RootState) => state.app.showOverview
const getMediasLayout = (state: RootState) => state.app.mediasLayout
const getCurrentSection = (state: RootState) => state.app.currentSection
const getShowLeftPanel = (state: RootState) => state.app.showLeftPanel
const getShowWarnings = (state: RootState) => state.app.showWarnings
const getShowRightPanel = (state: RootState) => state.app.showRightPanel
const getEditDatabaseLayout = (state: RootState) => state.app.editDatabaseLayout

const getDevice = (state: RootState) => state.app.device

const getShowCode = (state: RootState) => state.app.showCode

const getFocusedComponent = (id: IComponent['id']) => (
  state: RootState,
) => state.app.inputTextFocused && state.project.present.pages[state.project.present.activePage].selectedId === id

const getInputTextFocused = (state: RootState) =>
  state.app.inputTextFocused

module.exports = {
  getInputTextFocused,
  getFocusedComponent,
  getDevice,
  getShowCode,
  getEditDatabaseLayout,
  getShowRightPanel,
  getShowWarnings,
  getShowLeftPanel,
  getCurrentSection,
  getMediasLayout,
  getShowOverview,
  getPageLayout
}