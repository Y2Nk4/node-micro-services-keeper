import { Provider } from '../src'
import { ProviderConfig } from './config/config'
import CalculatorService from './thriftFiles/generated/_loader'

test('basic', async () => {
  let provider = new Provider(ProviderConfig)
  await provider.serve({
    'Calculator': {
      processor: CalculatorService.Calculator.services.Calculator,
      handler: {
        addInt (num1, num2, cb) {
          return cb(null, num1 + num2)
        }
      }
    }
  })

  expect(1).toBe(1)
})
