import dotenv from 'dotenv'

const MILLICAST = /^MILLICAST_/i

const getEnvironment = () => {
  dotenv.config()

  return Object.keys(process.env)
    .filter(key => MILLICAST.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key]
        return env
      },
      {}
    )
}

export default getEnvironment
