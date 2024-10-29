export async function retryUntilTrue(func: () => Promise<boolean>, timeoutSeconds = 10): Promise<boolean> {
  return retryUntil(func, timeoutSeconds, true);
  }
  
export async function retryUntilFalse(func: () => Promise<boolean>, timeoutSeconds = 10): Promise<boolean> {
  return retryUntil(func, timeoutSeconds, false);
  }
  
  async function retryUntil(func: () => Promise<boolean>, timeoutSeconds = 10, condition = false): Promise<boolean> {
    const timeout = timeoutSeconds * 1000
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const startTime = new Date().getTime()
    let result = true
    while (new Date().getTime() - startTime < timeout) {
      try {
        result = await func()
        if (condition === result) return result
      } catch {}
      await sleep(500)
    }
    return result
  }