import { expect, test } from '@playwright/test'

test('Main flow', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('link', { name: 'Get Started' }).click()
	await page.getByText('FlexiMax-Ti3C2 Type: MXene').click()
	await page.getByRole('button', { name: 'Go!' }).click()
	await page.getByText('Dr. Ava Singh').click()
	await page.getByRole('button', { name: 'Go!' }).click()
})

test('Error if no material selected', async ({ page }) => {
	await page.goto('/wizards/1/material')
	await page.getByRole('button', { name: 'Go!' }).click()
	await expect(page.getByRole('alert')).toBeVisible()
})

test('About flow', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('link', { name: 'Learn More' }).click()
})
