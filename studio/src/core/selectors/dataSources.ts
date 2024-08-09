import { RootState } from '~core/store'

const getModelNames = (state: RootState) => {
  return Object.keys(state.dataSources.models)
}

const getModelAttributes = (modelName: string) => (state: RootState) => {
  const attrs = state.dataSources.models[modelName]?.attributes
  return attrs
}

const getModels = (state: RootState) => {
  return state.dataSources.models
}

module.exports = {
  getModelNames,
  getModelAttributes,
  getModels
}