const sdk = require('api')('@render-api/v1.0#34i64rhilu8ilhkj')
import * as core from '@actions/core'

interface IOwner {
  cursor: string
  owner: {
    email: string
    id: string
    name: string
    type: string
  }
}
interface IGetOwnersResponse {
  data: IOwner[]
}

interface ServiceDetails {
  buildPlan: 'starter'
  env: 'docker'
  envSpecificDetails: {
    dockerCommand: string
    dockerContext: string
    dockerfilePath: string
  }
  healthCheckPath: string
  numInstances: number
  openPorts: number[] | null
  plan: 'free'
  pullRequestPreviewsEnabled: 'yes' | 'no'
  region: 'singapore'
  url: string
}

interface DeploymentConfig {
  autoDeploy: 'yes' | 'no'
  branch: string
  createdAt: string
  id: string
  name: string
  notifyOnFail: 'default'
  ownerId: string
  repo: string
  rootDir: string
  serviceDetails: ServiceDetails
  slug: string
  suspended: 'suspended' | 'not_suspended'
  suspenders: string[]
  type: 'web_service'
  updatedAt: string
}

enum ShellColors {
  RED = '\x1b[31m',
  GREEN = '\x1b[32m',
  YELLOW = '\x1b[33m',
  BLUE = '\x1b[34m',
  MAGENTA = '\x1b[330m',
  NOCOLOR = '\x1b[0m'
}

let render = {
  render_api_key: core.getInput('render_api_key'),
  service_id: core.getInput('service_id')
}
sdk.auth(render.render_api_key)
sdk
  .getOwners({ limit: '20' })
  .then(({ data }: { data: IGetOwnersResponse }) =>
    console.log(`${ShellColors.BLUE}Got Owners${ShellColors.NOCOLOR}`)
  )
  .catch((err: any) =>
    console.error(`${ShellColors.RED}Error: ${err}${ShellColors.NOCOLOR}`)
  )

interface Deployment {
  id: string
  commit: {
    id: string
    message: string
    createdAt: string
  }
  status: 'build_in_progress' | 'live' | 'build_failed' | 'canceled'
  trigger: 'api' | 'new_commit' | 'manual'
  createdAt: string
  updatedAt: string
  finishedAt: string | null
}
let deployId: string, deploymentStatus: string

// Convert 30 minutes to milliseconds
const TIMEOUT_IN_MS = +core.getInput('timeout') * 60 * 1000

// Set a timeout to exit the process after 30 minutes
const timeout = setTimeout(() => {
  sdk
    .cancelDeploy({ serviceId: render.service_id, deployId })
    .then(({ data }: { data: Deployment }) =>
      console.log(
        `${ShellColors.MAGENTA}Deployment Canceled${ShellColors.NOCOLOR}`
      )
    )
    .catch((err: any) => console.error(err))
  console.error(
    `${ShellColors.RED}Script timed out after being timedout${ShellColors.NOCOLOR}`
  )
  process.exit(1)
}, TIMEOUT_IN_MS)

// Clear the timeout if the deployment is successful or failed
function clearScriptTimeout() {
  clearTimeout(timeout)
}

export function triggerDeploy() {
  sdk
    .createDeploy({ clearCache: 'clear' }, { serviceId: render.service_id })
    .then(({ data }: { data: Deployment }) => {
      console.log(
        `${ShellColors.GREEN}Deployment Created${ShellColors.NOCOLOR}`
      )
      const { id } = data
      deployId = id
      setInterval(() => {
        sdk
          .getDeploy({ serviceId: render.service_id, deployId })
          .then(({ data }: { data: Deployment }) => {
            console.log(
              `${ShellColors.BLUE}Checking Deployment Status${ShellColors.NOCOLOR}`
            )
            const { status } = data
            deploymentStatus = status
            if (deploymentStatus === 'live') {
              clearScriptTimeout()
              console.log(
                `${ShellColors.MAGENTA}Deployment Successful${ShellColors.NOCOLOR}`
              )
              sdk
                .getService({ serviceId: render.service_id })
                .then(({ data }: { data: DeploymentConfig }) => {
                  console.log(
                    `${ShellColors.GREEN}Got Service Details${ShellColors.NOCOLOR}`
                  )
                  const { url } = data.serviceDetails
                  core.setOutput('render_url', url)
                })
                .catch((err: any) =>
                  console.error(
                    `${ShellColors.RED}Error: ${err}${ShellColors.NOCOLOR}`
                  )
                )
              process.exit(0)
            } else if (deploymentStatus === 'build_failed') {
              clearScriptTimeout()
              console.error(
                `${ShellColors.RED}Deployment failed${ShellColors.NOCOLOR}`
              )
              process.exit(1)
            } else if (deploymentStatus === 'canceled') {
              clearScriptTimeout()
              console.error(
                `${ShellColors.RED}Deployment canceled manually${ShellColors.NOCOLOR}`
              )
              process.exit(1)
            } else {
              console.log(
                `${ShellColors.YELLOW}Deployment in progress${ShellColors.NOCOLOR}`
              )
            }
          })
          .catch((err: any) => {
            clearScriptTimeout()
            console.error(
              `${ShellColors.RED}Error: ${err}${ShellColors.NOCOLOR}`
            )
          })
      }, 2000)
    })
    .catch((err: any) => {
      clearScriptTimeout()
      console.error(`${ShellColors.RED}Error: ${err}${ShellColors.NOCOLOR}`)
    })
}

triggerDeploy()

// let sdk = require('api')('@render-api/v1.0#34i64rhilu8ilhkj')

// sdk.auth('rnd_xAToYjK30ui8mFxaJb4siuAgSVkKd')
// sdk
//   .getOwners({ limit: '20' })
//   .then(({ data }) => console.log(data))
//   .catch(err => console.error(err))

// sdk = require('api')('@render-api/v1.0#34i64rhilu8ilhkj')

// sdk.auth('rnd_xAToYjK30ui8mFxaJb4siuAgSVkKd')
// sdk
//   .createDeploy(
//     { clearCache: 'clear' },
//     { serviceId: 'srv-co30071cf7o1s73928l7g' }
//   )
//   .then(({ data }) => console.log(data))
//   .catch(err => console.error(err))
