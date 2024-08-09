import React from 'react'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'

const bugsnagClient = bugsnag({
  apiKey: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY as string,
  releaseStage: process.env.NODE_ENV,
  notifyReleaseStages: ['production'],
})
bugsnagClient.use(bugsnagReact, React)

const ErrorBoundary = bugsnagClient.getPlugin('react')

module.exports = {
  bugsnagClient,
  ErrorBoundary
}