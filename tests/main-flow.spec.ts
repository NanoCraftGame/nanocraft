import { expect, test } from '@playwright/test';

test('Select material flow', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Get Started' }).click();
	await page.getByText('FlexiMax-Ti3C2 Type: MXene').click();
	await page.getByRole('button', { name: 'Submit' }).click();
});

test('About flow', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Learn More' }).click();
});
