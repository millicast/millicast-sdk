export async function retryUntilTrue(func: () => Promise<boolean>, timeoutSeconds = 10): Promise<boolean> {
    const timeout = timeoutSeconds * 1000
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const startTime = new Date().getTime()
    let result = false
  
    while (new Date().getTime() - startTime < timeout) {
      try {
        result = await func()
        if (result) return result
      } catch {}
      await sleep(500)
    }
    return result
  }
  
  export async function retryUntilFalse(func: () => Promise<boolean>, timeoutSeconds = 10): Promise<boolean> {
    const timeout = timeoutSeconds * 1000
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const startTime = new Date().getTime()
    let result = true
  
    while (new Date().getTime() - startTime < timeout) {
      try {
        result = await func()
        if (result === false) return result
      } catch {}
      await sleep(500)
    }
    return result
  }