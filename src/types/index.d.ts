// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Page } from 'puppeteer';

declare module 'puppeteer' {
    interface Page {
        // eslint-disable-next-line @typescript-eslint/method-signature-style
        waitForNetworkIdle(options?: {
            idleTime?: number
            timeout?: number
        }): Promise<void>
    }
}
