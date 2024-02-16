import { expect, test } from '@playwright/test'

test('Main flow', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('button', { name: 'Get Started' }).click()
	await page.getByText('Type: MXene').click()
	await page.getByRole('button', { name: 'Go!' }).click()
	await page.getByText('Dr. Ava Singh').click()
	// TODO check that it is in the crew part of the page
	await expect(page.getByText('Dr. Ava Singh')).toBeVisible()
	await page.getByText('Dr. Eli Wallace').click()
	// TODO check that it is in the crew part of the page
	await expect(page.getByText('Dr. Eli Wallace')).toBeVisible()

	await page.getByRole('button', { name: 'Go!' }).click()
})

test('Error if no material selected', async ({ page }) => {
	await page.goto('/wizards/1/material')
	await page.getByRole('button', { name: 'Go!' }).click()
	await expect(page.getByRole('alert')).toBeVisible()
})

test('About flow', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('button', { name: 'Learn More' }).click()
})
