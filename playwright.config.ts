import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', timeout: 30000, retries: 0, workers: 2,
  reporter: [['list']],
  use: { baseURL:'http://127.0.0.1:5173', screenshot:'only-on-failure', trace:'retain-on-failure' },
  projects:[
    {name:'mobile-320',use:{browserName:'chromium',viewport:{width:320,height:800},isMobile:true,hasTouch:true}},
    {name:'mobile-390',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
    {name:'mobile-430',use:{browserName:'chromium',viewport:{width:430,height:932},isMobile:true,hasTouch:true}},
    {name:'webkit-390',use:{browserName:'webkit',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
    {name:'desktop',use:{browserName:'chromium',viewport:{width:1280,height:900}}},
  ],
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',url:'http://127.0.0.1:5173',reuseExistingServer:false,env:{VITE_API_URL:'http://127.0.0.1:5173'}},
});
