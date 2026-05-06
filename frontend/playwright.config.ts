import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: 1,
    reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : [
        {
            command: 'mvn spring-boot:run',
            cwd: '../backend',
            env: {
                SPRING_DATASOURCE_URL: process.env.SPRING_DATASOURCE_URL || 'jdbc:postgresql://127.0.0.1:5432/tophat_health',
                SPRING_DATASOURCE_USERNAME: process.env.SPRING_DATASOURCE_USERNAME || 'tophat',
                SPRING_DATASOURCE_PASSWORD: process.env.SPRING_DATASOURCE_PASSWORD || 'tophat',
                APP_STORAGE_LOCATION: process.env.APP_STORAGE_LOCATION || './storage-e2e',
                SERVER_PORT: '8080'
            },
            url: 'http://127.0.0.1:8080/swagger-ui/index.html',
            timeout: 120_000,
            reuseExistingServer: !isCI
        },
        {
            command: 'npm run start -- --hostname 127.0.0.1 --port 3100',
            cwd: '.',
            url: 'http://127.0.0.1:3100',
            timeout: 120_000,
            reuseExistingServer: !isCI
        }
    ],
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]
});
