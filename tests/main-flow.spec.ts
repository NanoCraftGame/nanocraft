import { expect, test } from '@playwright/test'

test('Main flow', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('button', { name: 'Get Started' }).click()
	/* -- select material -- */
	await page.getByText('Type: MXene').click()
	await page.getByRole('button', { name: 'Go!' }).click()
	/* -- choose crew -- */
	await page.waitForSelector('[data-page="crew"]')
	const char1 = page.locator('li').getByRole('heading').nth(1)
	const yourName = await char1.textContent()
	const crewSelected = page.getByTestId('crew-selected')
	await char1.click()
	await expect(crewSelected.getByText(yourName!)).toBeVisible()
	await expect(crewSelected.getByText(yourName!)).toContainText('You')
	const char2 = page.locator('li').getByRole('heading').nth(2)
	const colleagueName = await char2.textContent()
	await char2.click()
	await expect(crewSelected.getByText(colleagueName!)).toBeVisible()
	await expect(crewSelected.getByText(colleagueName!)).toContainText('colleague')
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
