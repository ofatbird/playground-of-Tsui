const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');
const to = require('await-to-js').to
const ip = ['97.64.127.44', '111.74.56.249', '121.41.175.199']
let keyword = 'Lesbian House Hunters #14'
const random = () => Math.floor(Math.random() * 3)
const dataOrigin = jsonfile.readFileSync('gf.json') 

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
puppeteer.launch().then(async browser => {
    let err, html;
    let count = 1;
    const curpage = {}
    while (count < 10) {
        console.log(count)
        keyword = dataOrigin[count].name.replace('#', '')
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
            'Cookie': 'AD_enterTime=1513925919; AD_adst_b_M_300x50=0; AD_exoc_b_M_300x50=0; AD_jav_b_M_300x50=0; AD_javu_b_M_300x50=0; AD_wav_b_M_300x50=0; AD_wwwp_b_M_300x50=0; AD_clic_b_POPUNDER=2; AD_adst_b_SM_T_728x90=1; AD_popa_b_POPUNDER=2; AD_exoc_b_SM_T_728x90=1; AD_adca_b_SM_T_728x90=1; AD_jav_b_SM_B_728x90=1; AD_popc_b_POPUNDER=1; AD_jav_b_SM_T_728x90=1; AD_adca_b_POPUNDER=1; AD_wwwp_b_SM_T_728x90=1; AD_wav_b_SM_B_728x90=1; AD_gung_b_POPUNDER=1',
            'Host': 'btso.pw',
            'X-Forwarded-For': ip[random()]
        })
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:57.0) Gecko/20100101 Firefox/56.0')
        const [networkErr] = await to(page.goto('https://btso.pw/search/' + keyword + '/page/count', {
            waitUntil: 'domcontentloaded'
        }));
        if (networkErr) {
            await page.close()
            console.log(networkErr)
            continue;
        }
        [err, html] = await to(page.$eval('.data-list', el => el.outerHTML));
        await page.close()
        if (err) {
            console.log(`It's finished maybe`)
            console.log(count)
            count++
            continue;
        }
        const $ = cheerio.load(html);
        $('.row').each((index, ele) => {
            if (!index) return;
            const $ele = $(ele)
            const itemA = $ele.find('a')
            curpage[index] = {
                title: itemA.attr('title'),
                mag: itemA.attr('href'),
                size: $ele.find('.size').text(),
            }
            // console.log($(ele).find('.size').text())
        });
        console.log('writing file')
        jsonfile.writeFileSync(`./json/gf-magnet-${count}.json`, curpage)
        curpage.length = 0
        await sleep(5000)
        count++;
    }
    // console.log(curpage) //cover 
    await browser.close();

});