const dev = process.env.NODE_ENV !== 'production'

const config = {
  baseURL: dev ? 'api' :  'http://61.140.21.164:65501',
}
export default config
