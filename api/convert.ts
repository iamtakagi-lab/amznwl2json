import chromium from "chrome-aws-lambda"
import { VercelRequest, VercelResponse } from "@vercel/node"
import { devices, Browser, Page } from "puppeteer-core";

const device = devices['iPhone 8'];
const baseUrl = 'https://www.amazon.co.jp/hz/wishlist/ls/';

const execute = async (wishlistId: string) => {
  const { puppeteer } = chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    env: {
      ...process.env,
      LANG: "ja_JP.UTF-8"
    }
  });
  try {
    const page = await init(browser)
    await page.goto(baseUrl + wishlistId)
    return await scrape(page)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    browser.close()
  }
}

const init = async (browser: Browser) => {
  const page = await browser.newPage()
  await page.emulate(device);
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`)
  });
  return page;
}

const scrape = async (page: Page) => {
  return await page.evaluate(async () => {
    const distance = 500;
    const delay = 100;
    while (!document.querySelector('#no-items-section-anywhere')) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise(resolve => {
        setTimeout(resolve, delay);
      });
    }

    const data = [];
    document.querySelectorAll('a[href^="/dp/"].a-touch-link').forEach(
      el => {
        const productId = el
          .getAttribute('href')
          .split('/?coliid')[0]
          .replace('/dp/', '');
        const title = el.querySelector('[id^="item_title_"]').textContent
        const priceEle = el.querySelector('[id^="itemPrice_"] > span')
        const price = Number(
            priceEle.textContent.replace('￥', '').replace(',', '')
        );
        data.push({
          price,
          title,
          productId
        })
      }
    );
    return data;
  })
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const wishlistId = req.query["wishlistId"]

  if (typeof wishlistId !== "string") return res.status(400).write("invalid type: wishlistId")

  try {
    const data = await execute(wishlistId)
    res.setHeader('Content-Type', 'application/json')
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500)
  }
}