import { newE2EPage } from '@stencil/core/testing';

describe('manage-questions', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<manage-questions></manage-questions>');

    const element = await page.find('manage-questions');
    expect(element).toHaveClass('hydrated');
  });

});
